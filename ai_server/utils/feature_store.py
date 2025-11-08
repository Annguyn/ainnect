import numpy as np
import pandas as pd
from typing import Dict, List, Any
import networkx as nx
from datetime import datetime, timedelta
import logging
from config import *
from utils.database import get_db_connection

logger = logging.getLogger(__name__)

class FeatureStore:
    def debug_data_status(self, user_id: int) -> Dict[str, Any]:
        """Debug function to check data status"""
        debug_info = {}
        
        with get_db_connection() as cursor:
            try:
                # Check if user exists
                cursor.execute("""
                    SELECT id, username, display_name 
                    FROM users 
                    WHERE id = %s
                """, (user_id,))
                user = cursor.fetchone()
                debug_info['user_exists'] = user is not None
                if user:
                    debug_info['user_info'] = user
                
                # Check total users
                cursor.execute("SELECT COUNT(*) as total_users FROM users")
                debug_info['total_users'] = cursor.fetchone()['total_users']
                
                # Check total friendships
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_friendships,
                        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_friendships
                    FROM friendships
                """)
                friendship_stats = cursor.fetchone()
                debug_info.update(friendship_stats)
                
                # Check user's friends
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_user_friendships,
                        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as user_accepted_friendships
                    FROM friendships 
                    WHERE user_id_low = %s OR user_id_high = %s
                """, (user_id, user_id))
                user_friendship_stats = cursor.fetchone()
                debug_info.update(user_friendship_stats)
                
                # Check user's features
                cursor.execute("""
                    SELECT 
                        COUNT(DISTINCT i.id) as interest_count,
                        COUNT(DISTINCT e.id) as education_count,
                        COUNT(DISTINCT w.id) as work_count
                    FROM users u
                    LEFT JOIN interests i ON u.id = i.user_id
                    LEFT JOIN educations e ON u.id = e.user_id
                    LEFT JOIN work_experiences w ON u.id = w.user_id
                    WHERE u.id = %s
                """, (user_id,))
                feature_stats = cursor.fetchone()
                debug_info['feature_stats'] = feature_stats
                
                # Get sample of potential friends
                cursor.execute("""
                    SELECT u.id, u.username, u.display_name
                    FROM users u
                    WHERE u.id NOT IN (
                        SELECT CASE 
                            WHEN user_id_low = %s THEN user_id_high
                            WHEN user_id_high = %s THEN user_id_low
                        END
                        FROM friendships
                        WHERE status = 'accepted'
                        AND (user_id_low = %s OR user_id_high = %s)
                    )
                    AND u.id != %s
                    LIMIT 5
                """, (user_id, user_id, user_id, user_id, user_id))
                debug_info['potential_friends'] = cursor.fetchall()
                
                logger.info(f"Debug info for user {user_id}: {debug_info}")
                
            except Exception as e:
                logger.error(f"Error in debug_data_status: {str(e)}")
                debug_info['error'] = str(e)
            
        return debug_info

    def get_user_features(self, user_id: int) -> np.ndarray:
        """Get user features for embedding model"""
        with get_db_connection() as cursor:
            try:
                # Basic user info
                cursor.execute("""
                    SELECT 
                        u.id,
                        u.username,
                        u.display_name,
                        u.location,
                        u.created_at,
                        GROUP_CONCAT(DISTINCT i.name) as interests,
                        COUNT(DISTINCT e.id) as num_educations,
                        COUNT(DISTINCT w.id) as num_work_experiences,
                        COUNT(DISTINCT g.group_id) as num_groups
                    FROM users u
                    LEFT JOIN interests i ON u.id = i.user_id
                    LEFT JOIN educations e ON u.id = e.user_id
                    LEFT JOIN work_experiences w ON u.id = w.user_id
                    LEFT JOIN group_members g ON u.id = g.user_id
                    WHERE u.id = %s
                    GROUP BY u.id
                """, (user_id,))
                
                user_info = cursor.fetchone()
                if not user_info:
                    logger.warning(f"No user found with id {user_id}")
                    return None
                
                # Activity features
                cursor.execute("""
                    SELECT
                        COUNT(DISTINCT p.id) as post_count,
                        COUNT(DISTINCT c.id) as comment_count,
                        COUNT(DISTINCT r.id) as reaction_count,
                        COUNT(DISTINCT s.id) as share_count
                    FROM users u
                    LEFT JOIN posts p ON u.id = p.author_id
                    LEFT JOIN comments c ON u.id = c.author_id
                    LEFT JOIN reactions r ON u.id = r.user_id
                    LEFT JOIN shares s ON u.id = s.by_user_id
                    WHERE u.id = %s AND
                          (p.created_at >= NOW() - INTERVAL %s DAY OR
                           c.created_at >= NOW() - INTERVAL %s DAY OR
                           r.created_at >= NOW() - INTERVAL %s DAY OR
                           s.created_at >= NOW() - INTERVAL %s DAY)
                """, (user_id, INTERACTION_WINDOW_DAYS, INTERACTION_WINDOW_DAYS,
                      INTERACTION_WINDOW_DAYS, INTERACTION_WINDOW_DAYS))
                
                activity = cursor.fetchone()
                
                # Convert categorical features to embeddings/one-hot
                features = []
                
                # Basic features
                features.extend([
                    user_info['num_educations'] or 0,
                    user_info['num_work_experiences'] or 0,
                    user_info['num_groups'] or 0,
                    activity['post_count'] or 0,
                    activity['comment_count'] or 0,
                    activity['reaction_count'] or 0,
                    activity['share_count'] or 0
                ])
                
                # Interest embeddings (simplified)
                interests = user_info['interests'].split(',') if user_info['interests'] else []
                interest_vec = np.zeros(100)  # Simplified 100-dim interest embedding
                for interest in interests:
                    interest_vec += np.random.randn(100)  # Replace with proper embeddings
                features.extend(interest_vec)
                
                # Location embedding (simplified)
                location_vec = np.random.randn(50)  # Replace with proper location embedding
                features.extend(location_vec)
                
                logger.debug(f"Generated features for user {user_id}: shape={len(features)}")
                return np.array(features, dtype=np.float32)
                
            except Exception as e:
                logger.error(f"Error getting user features: {str(e)}")
                return None

    def get_ranking_features(self, user_id: int, candidate_id: int) -> Dict[str, float]:
        """Get features for ranking model"""
        with get_db_connection() as cursor:
            try:
                # Graph features
                cursor.execute("""
                    WITH user_friends AS (
                        SELECT user_id_low as user_id, user_id_high as friend_id
                        FROM friendships WHERE status = 'accepted'
                        UNION ALL
                        SELECT user_id_high as user_id, user_id_low as friend_id
                        FROM friendships WHERE status = 'accepted'
                    )
                    SELECT COUNT(DISTINCT f2.friend_id) as common_neighbors
                    FROM user_friends f1
                    JOIN user_friends f2 ON f1.friend_id = f2.friend_id
                    WHERE f1.user_id = %s AND f2.user_id = %s
                """, (user_id, candidate_id))
                graph_features = cursor.fetchone()
                
                # Attribute similarity
                cursor.execute("""
                    SELECT 
                        COUNT(DISTINCT i1.name) as common_interests,
                        COUNT(DISTINCT e1.school_name) as common_schools,
                        COUNT(DISTINCT e1.field_of_study) as common_fields,
                        COUNT(DISTINCT w1.company_name) as common_companies,
                        COUNT(DISTINCT w1.position) as common_positions
                    FROM users u1
                    CROSS JOIN users u2
                    LEFT JOIN interests i1 ON u1.id = i1.user_id
                    LEFT JOIN interests i2 ON u2.id = i2.user_id AND i1.name = i2.name
                    LEFT JOIN educations e1 ON u1.id = e1.user_id
                    LEFT JOIN educations e2 ON u2.id = e2.user_id AND e1.school_name = e2.school_name
                    LEFT JOIN work_experiences w1 ON u1.id = w1.user_id
                    LEFT JOIN work_experiences w2 ON u2.id = w2.user_id AND w1.company_name = w2.company_name
                    WHERE u1.id = %s AND u2.id = %s
                """, (user_id, candidate_id))
                attr_features = cursor.fetchone()
                
                # Interaction features
                cursor.execute("""
                    WITH interactions AS (
                        SELECT 'post' as type, p.created_at
                        FROM posts p
                        WHERE p.author_id = %s AND EXISTS (
                            SELECT 1 FROM reactions r WHERE r.target_id = p.id AND r.user_id = %s
                        )
                        UNION ALL
                        SELECT 'comment', c.created_at
                        FROM comments c
                        JOIN posts p ON c.post_id = p.id
                        WHERE (p.author_id = %s AND c.author_id = %s) OR
                              (p.author_id = %s AND c.author_id = %s)
                    )
                    SELECT 
                        COUNT(*) as total_interactions,
                        COUNT(DISTINCT type) as interaction_types,
                        COUNT(CASE WHEN created_at >= NOW() - INTERVAL %s DAY THEN 1 END) as recent_interactions
                    FROM interactions
                """, (user_id, candidate_id, user_id, candidate_id, 
                      candidate_id, user_id, INTERACTION_WINDOW_DAYS))
                interaction_features = cursor.fetchone()
                
                return {
                    # Graph features
                    'common_neighbors': float(graph_features['common_neighbors'] or 0),
                    'jaccard_similarity': 0.0,  # Computed in graph module
                    'adamic_adar': 0.0,  # Computed in graph module
                    'ppr_score': 0.0,  # Computed in graph module
                    'lightgcn_score': 0.0,  # Computed by LightGCN model
                    
                    # Attribute features
                    'interest_overlap': float(attr_features['common_interests'] or 0),
                    'school_overlap': float(attr_features['common_schools'] or 0),
                    'field_overlap': float(attr_features['common_fields'] or 0),
                    'edu_years_overlap': 0.0,  # Needs temporal computation
                    'company_overlap': float(attr_features['common_companies'] or 0),
                    'position_overlap': float(attr_features['common_positions'] or 0),
                    'work_years_overlap': 0.0,  # Needs temporal computation
                    'location_similarity': 0.0,  # Needs location embedding similarity
                    
                    # Interaction features
                    'total_interactions': float(interaction_features['total_interactions'] or 0),
                    'interaction_types': int(interaction_features['interaction_types'] or 0),
                    'recency_score': float(interaction_features['recent_interactions'] or 0),
                    'group_overlap': 0.0,  # Needs group similarity computation
                    'group_interaction_score': 0.0,  # Needs group interaction analysis
                    
                    # Diversity features
                    'cluster_penalty': 0.0,  # Computed during reranking
                    'hub_penalty': 0.0,  # Based on degree centrality
                    'freshness_score': 1.0  # Based on recommendation history
                }
                
            except Exception as e:
                logger.error(f"Error getting ranking features: {str(e)}")
                return None

    def get_social_graph(self) -> nx.Graph:
        """Get social graph for graph algorithms"""
        with get_db_connection() as cursor:
            try:
                cursor.execute("""
                    SELECT user_id_low, user_id_high
                    FROM friendships
                    WHERE status = 'accepted'
                """)
                edges = cursor.fetchall()
                
                G = nx.Graph()
                for u, v in edges:
                    G.add_edge(int(u), int(v))
                
                logger.debug(f"Built social graph with {G.number_of_nodes()} nodes and {G.number_of_edges()} edges")
                return G
                
            except Exception as e:
                logger.error(f"Error building social graph: {str(e)}")
                return nx.Graph()  # Return empty graph on error

    def get_user_info(self, user_id: int) -> Dict[str, Any]:
        """Get user info for recommendation response"""
        with get_db_connection() as cursor:
            try:
                cursor.execute("""
                    SELECT 
                        u.id,
                        u.username,
                        u.display_name,
                        u.avatar_url,
                        u.location,
                        GROUP_CONCAT(DISTINCT i.name) as interests,
                        COUNT(DISTINCT CASE 
                            WHEN f.status = 'accepted' AND 
                                 (f.user_id_low = u.id OR f.user_id_high = u.id) 
                            THEN CONCAT(f.user_id_low, '-', f.user_id_high)
                        END) as friend_count
                    FROM users u
                    LEFT JOIN interests i ON u.id = i.user_id
                    LEFT JOIN friendships f ON (f.user_id_low = u.id OR f.user_id_high = u.id)
                    WHERE u.id = %s
                    GROUP BY u.id
                """, (user_id,))
                user_info = cursor.fetchone()
                
                if user_info:
                    user_info['interests'] = user_info['interests'].split(',') if user_info['interests'] else []
                
                return user_info
                
            except Exception as e:
                logger.error(f"Error getting user info: {str(e)}")
                return None