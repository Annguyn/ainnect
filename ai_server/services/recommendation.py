import numpy as np
import faiss
import redis
import json
import os
import torch
from typing import List, Dict, Tuple, Set
import networkx as nx
from models.graph_metrics import GraphMetrics
from services.visualization import (plot_social_network, 
                                  plot_similarity_heatmap,
                                  plot_recommendation_scores)
from config import *
from utils.database import get_db_connection
from utils.feature_store import FeatureStore
import logging

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.feature_store = FeatureStore()
        try:
            self.redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                decode_responses=True
            )
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning(f"Could not connect to Redis: {e}. Caching disabled.")
            self.redis_client = None
    
    def _build_social_graph(self) -> nx.Graph:
        """Build social graph from database"""
        with get_db_connection() as cursor:
            # Get all friendships including pending ones
            cursor.execute("""
                WITH all_connections AS (
                    -- Accepted friendships
                    SELECT 
                        user_id_low as user1,
                        user_id_high as user2,
                        'friend' as relationship,
                        created_at
                    FROM friendships
                    WHERE status = 'accepted'
                    
                    UNION ALL
                    
                    -- Interactions through comments
                    SELECT DISTINCT
                        p.author_id as user1,
                        c.author_id as user2,
                        'interaction' as relationship,
                        c.created_at
                    FROM posts p
                    JOIN comments c ON p.id = c.post_id
                    WHERE p.author_id != c.author_id
                    
                    UNION ALL
                    
                    -- Interactions through reactions
                    SELECT DISTINCT
                        p.author_id as user1,
                        r.user_id as user2,
                        'interaction' as relationship,
                        r.created_at
                    FROM posts p
                    JOIN reactions r ON p.id = r.target_id
                    WHERE p.author_id != r.user_id
                )
                SELECT 
                    user1,
                    user2,
                    relationship,
                    COUNT(*) as weight
                FROM all_connections
                GROUP BY user1, user2, relationship
            """)
            edges = cursor.fetchall()
            
            # Get all users
            cursor.execute("""
                SELECT 
                    u.id,
                    u.username,
                    u.display_name,
                    COUNT(DISTINCT i.id) as interest_count,
                    COUNT(DISTINCT e.id) as education_count,
                    COUNT(DISTINCT w.id) as work_count
                FROM users u
                LEFT JOIN interests i ON u.id = i.user_id
                LEFT JOIN educations e ON u.id = e.user_id
                LEFT JOIN work_experiences w ON u.id = w.user_id
                GROUP BY u.id, u.username, u.display_name
            """)
            users = {row['id']: {
                'username': row['username'],
                'display_name': row['display_name'],
                'interest_count': row['interest_count'],
                'education_count': row['education_count'],
                'work_count': row['work_count']
            } for row in cursor.fetchall()}
            
        # Build graph
        G = nx.Graph()
        
        # Add nodes with attributes
        for user_id, attrs in users.items():
            G.add_node(user_id, **attrs)
        
        # Add edges with weights
        for edge in edges:
            # Base weight from relationship type
            if edge['relationship'] == 'friend':
                weight = 1.0
            else:  # interaction
                weight = min(0.1 * edge['weight'], 0.8)  # Cap at 0.8
                
            # Add or update edge
            if G.has_edge(edge['user1'], edge['user2']):
                # Take maximum weight if edge already exists
                G[edge['user1']][edge['user2']]['weight'] = max(
                    G[edge['user1']][edge['user2']]['weight'],
                    weight
                )
            else:
                G.add_edge(edge['user1'], edge['user2'], weight=weight)
        
        return G
    
    def _get_user_features(self, user_id: int) -> Dict:
        """Get user features from database"""
        with get_db_connection() as cursor:
            # Get interests with categories
            cursor.execute("""
                SELECT i.name, i.category
                FROM interests i
                WHERE i.user_id = %s
            """, (user_id,))
            interests = {}
            for row in cursor.fetchall():
                category = row['category'] or 'general'
                if category not in interests:
                    interests[category] = set()
                interests[category].add(row['name'])
            
            # Get education
            cursor.execute("""
                SELECT 
                    school_name,
                    field_of_study,
                    degree,
                    EXTRACT(YEAR FROM start_date) as start_year,
                    EXTRACT(YEAR FROM end_date) as end_year
                FROM educations 
                WHERE user_id = %s
            """, (user_id,))
            education = []
            for row in cursor.fetchall():
                education.append({
                    'school': row['school_name'],
                    'field': row['field_of_study'],
                    'degree': row['degree'],
                    'years': (row['start_year'], row['end_year'])
                })
            
            # Get work
            cursor.execute("""
                SELECT 
                    company_name,
                    position,
                    EXTRACT(YEAR FROM start_date) as start_year,
                    EXTRACT(YEAR FROM end_date) as end_year
                FROM work_experiences
                WHERE user_id = %s
            """, (user_id,))
            work = []
            for row in cursor.fetchall():
                work.append({
                    'company': row['company_name'],
                    'position': row['position'],
                    'years': (row['start_year'], row['end_year'])
                })
            
        return {
            'interests': interests,
            'education': education,
            'work': work
        }
    
    def _calculate_feature_similarity(self, 
                                   user_features: Dict,
                                   candidate_features: Dict) -> Dict[str, float]:
        """Calculate detailed feature similarity scores"""
        scores = {}
        
        # Interest similarity by category
        interest_scores = []
        all_categories = set(user_features['interests'].keys()) | \
                        set(candidate_features['interests'].keys())
        
        for category in all_categories:
            user_interests = user_features['interests'].get(category, set())
            candidate_interests = candidate_features['interests'].get(category, set())
            
            if user_interests or candidate_interests:
                overlap = len(user_interests & candidate_interests)
                union = len(user_interests | candidate_interests)
                score = overlap / union if union > 0 else 0
                interest_scores.append(score)
        
        scores['interest_similarity'] = sum(interest_scores) / len(interest_scores) \
                                      if interest_scores else 0
        
        # Education similarity
        edu_scores = []
        for user_edu in user_features['education']:
            for cand_edu in candidate_features['education']:
                score = 0
                # Same school
                if user_edu['school'] == cand_edu['school']:
                    score += 0.4
                # Same field
                if user_edu['field'] == cand_edu['field']:
                    score += 0.4
                # Overlapping years
                if user_edu['years'] and cand_edu['years']:
                    user_start, user_end = user_edu['years']
                    cand_start, cand_end = cand_edu['years']
                    if user_start and user_end and cand_start and cand_end:
                        if max(user_start, cand_start) <= min(user_end, cand_end):
                            score += 0.2
                
                edu_scores.append(score)
        
        scores['education_similarity'] = max(edu_scores) if edu_scores else 0
        
        # Work similarity
        work_scores = []
        for user_work in user_features['work']:
            for cand_work in candidate_features['work']:
                score = 0
                # Same company
                if user_work['company'] == cand_work['company']:
                    score += 0.4
                # Similar position
                if user_work['position'] == cand_work['position']:
                    score += 0.2
                # Overlapping years
                if user_work['years'] and cand_work['years']:
                    user_start, user_end = user_work['years']
                    cand_start, cand_end = cand_work['years']
                    if user_start and user_end and cand_start and cand_end:
                        if max(user_start, cand_start) <= min(user_end, cand_end):
                            score += 0.1
                
                work_scores.append(score)
        
        scores['work_similarity'] = max(work_scores) if work_scores else 0
        
        # Overall similarity with weighted combination
        scores['overall_similarity'] = (
            0.4 * scores['interest_similarity'] +
            0.3 * scores['education_similarity'] +
            0.3 * scores['work_similarity']
        )
        
        return scores
    
    def get_recommendations(self, user_id: int, top_k: int = 5) -> Dict:
        """Get friend recommendations using graph metrics and feature similarity"""
        try:
            # Build social graph including interactions
            graph = self._build_social_graph()
            metrics = GraphMetrics(graph)
            
            # Get graph statistics
            graph_stats = metrics.get_graph_stats()
            logger.info(f"Graph stats: {graph_stats}")
            
            # Get user's node metrics
            node_metrics = metrics.get_node_metrics(user_id)
            logger.info(f"Node metrics for user {user_id}: {node_metrics}")
            
            # Get existing friends
            existing_friends = {n for n in graph.neighbors(user_id)
                              if graph[user_id][n].get('weight', 0) >= 1.0}
            
            # Get user features
            user_features = self._get_user_features(user_id)
            
            # Get link predictions with custom weights based on user's profile completeness
            weights = {'cn': 0.3, 'jc': 0.2, 'aa': 0.3, 'katz': 0.2}
            
            # Adjust weights if user has few connections
            if node_metrics['degree'] < 2:
                weights = {'cn': 0.2, 'jc': 0.2, 'aa': 0.2, 'katz': 0.4}
            
            predictions = metrics.predict_links(
                source_node=user_id,
                excluded_nodes=existing_friends,
                top_k=top_k * 2,
                weights=weights
            )
            
            # Enhance predictions with feature similarity
            enhanced_predictions = []
            for candidate_id, scores in predictions:
                # Get candidate features
                candidate_features = self._get_user_features(candidate_id)
                
                # Calculate feature similarity
                feature_sim = self._calculate_feature_similarity(
                    user_features, candidate_features
                )
                
                # Calculate interaction score from graph
                interaction_weight = 0
                if graph.has_edge(user_id, candidate_id):
                    interaction_weight = graph[user_id][candidate_id].get('weight', 0)
                
                # Combine all scores
                graph_score = scores['total_score']
                feature_score = feature_sim['overall_similarity']
                interaction_score = min(interaction_weight, 0.8)  # Cap at 0.8
                
                # Weight the scores based on availability
                has_features = any(
                    feature_sim[k] > 0 
                    for k in ['interest_similarity', 'education_similarity', 'work_similarity']
                )
                
                if has_features and interaction_score > 0:
                    # We have all signals
                    total_score = (
                        0.4 * graph_score +
                        0.4 * feature_score +
                        0.2 * interaction_score
                    )
                elif has_features:
                    # No interactions, but have features
                    total_score = 0.6 * graph_score + 0.4 * feature_score
                elif interaction_score > 0:
                    # No features, but have interactions
                    total_score = 0.7 * graph_score + 0.3 * interaction_score
                else:
                    # Only graph metrics
                    total_score = graph_score
                
                enhanced_predictions.append({
                    'user_id': candidate_id,
                    'username': graph.nodes[candidate_id]['username'],
                    'display_name': graph.nodes[candidate_id]['display_name'],
                    'score': total_score,
                    'graph_metrics': {
                        'common_neighbors': scores['metrics']['cn'],
                        'jaccard': scores['metrics']['jc'],
                        'adamic_adar': scores['metrics']['aa'],
                        'katz': scores['metrics']['katz']
                    },
                    'feature_similarity': feature_sim,
                    'interaction_score': interaction_score
                })
            
            # Sort by total score and get top-k
            enhanced_predictions.sort(key=lambda x: x['score'], reverse=True)
            results = enhanced_predictions[:top_k]
            
            # Build explanation
            explanations = []
            for rec in results:
                reasons = []
                
                # Graph-based reasons
                if rec['graph_metrics']['common_neighbors'] > 0:
                    reasons.append(f"{rec['graph_metrics']['common_neighbors']} mutual friends")
                if rec['graph_metrics']['katz'] > 0:
                    reasons.append("Connected through network")
                    
                # Feature-based reasons
                if rec['feature_similarity']['interest_similarity'] > 0:
                    reasons.append("Similar interests")
                if rec['feature_similarity']['education_similarity'] > 0:
                    reasons.append("Educational background match")
                if rec['feature_similarity']['work_similarity'] > 0:
                    reasons.append("Professional background match")
                    
                # Interaction-based reasons
                if rec['interaction_score'] > 0:
                    reasons.append("Previous interactions")
                
                rec['recommendation_reasons'] = reasons
            
            # Generate visualizations
            network_plot = plot_social_network(graph, user_id, results)
            similarity_plot = plot_similarity_heatmap(results)
            scores_plot = plot_recommendation_scores(results)
            
            # Prepare response
            response = {
                'recommendations': results,
                'graph_stats': graph_stats,
                'user_metrics': node_metrics,
                'visualizations': {
                    'network': network_plot,
                    'similarity': similarity_plot,
                    'scores': scores_plot
                },
                'explanation': {
                    'graph_based': "Recommendations are based on network structure "
                                 "using Common Neighbors, Jaccard Coefficient, "
                                 "Adamic-Adar and Katz indices.",
                    'feature_based': "Additional scoring from matching interests, "
                                   "education, and work experience.",
                    'interaction_based': "Considering previous interactions through "
                                       "comments and reactions."
                }
            }
            
            logger.info(f"Generated {len(results)} recommendations for user {user_id}")
            return response
            
        except Exception as e:
            logger.error(f"Error in get_recommendations: {str(e)}")
            raise