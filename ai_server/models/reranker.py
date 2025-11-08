import xgboost as xgb

import numpy as np
import os
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class RankingFeatures:
    # Graph features
    common_neighbors: float
    jaccard_similarity: float
    adamic_adar: float
    ppr_score: float
    lightgcn_score: float
    
    # Attribute features
    interest_overlap: float
    school_overlap: float
    field_overlap: float
    edu_years_overlap: float
    company_overlap: float
    position_overlap: float
    work_years_overlap: float
    location_similarity: float
    
    # Interaction features
    total_interactions: float
    interaction_types: int
    recency_score: float
    group_overlap: float
    group_interaction_score: float
    
    # Diversity features
    cluster_penalty: float
    hub_penalty: float
    freshness_score: float

class XGBoostReranker:
    def __init__(self, model_path: str = None):
        self.model = None
        if model_path and os.path.exists(model_path):
            self.model = xgb.Booster()
            self.model.load_model(model_path)
    
    def prepare_features(self, features: List[RankingFeatures]) -> np.ndarray:
        """Convert RankingFeatures to XGBoost compatible format"""
        feature_matrix = []
        for f in features:
            feature_vector = [
                # Graph features
                f.common_neighbors,
                f.jaccard_similarity,
                f.adamic_adar,
                f.ppr_score,
                f.lightgcn_score,
                
                # Attribute features
                f.interest_overlap,
                f.school_overlap,
                f.field_overlap,
                f.edu_years_overlap,
                f.company_overlap,
                f.position_overlap,
                f.work_years_overlap,
                f.location_similarity,
                
                # Interaction features
                f.total_interactions,
                f.interaction_types,
                f.recency_score,
                f.group_overlap,
                f.group_interaction_score,
                
                # Diversity features
                f.cluster_penalty,
                f.hub_penalty,
                f.freshness_score
            ]
            feature_matrix.append(feature_vector)
        return np.array(feature_matrix)
    
    def score_single(self, features: RankingFeatures) -> float:
        """Score a single candidate"""
        if not self.model:
            raise ValueError("Model not loaded")
        
        feature_vector = self.prepare_features([features])
        dmatrix = xgb.DMatrix(feature_vector)
        return float(self.model.predict(dmatrix)[0])
    
    def rerank(self, 
               candidates: List[Tuple[int, RankingFeatures]], 
               top_k: int = 20) -> List[Tuple[int, float]]:
        """
        Rerank candidates using XGBoost model
        Args:
            candidates: List of (user_id, features) tuples
            top_k: Number of recommendations to return
        Returns:
            List of (user_id, score) tuples
        """
        if not self.model:
            raise ValueError("Model not loaded")
            
        user_ids, features = zip(*candidates)
        feature_matrix = self.prepare_features(features)
        dmatrix = xgb.DMatrix(feature_matrix)
        scores = self.model.predict(dmatrix)
        
        # Sort by score and return top-k
        ranked_candidates = list(zip(user_ids, scores))
        ranked_candidates.sort(key=lambda x: x[1], reverse=True)
        return ranked_candidates[:top_k]
    
    def train(self, 
             train_features: List[RankingFeatures],
             train_labels: List[int],
             valid_features: List[RankingFeatures] = None,
             valid_labels: List[int] = None,
             model_path: str = 'models/xgboost_ranker.model'):
        """Train XGBoost ranker"""
        params = {
            'objective': 'binary:logistic',
            'eval_metric': ['auc', 'ndcg@20'],
            'max_depth': 6,
            'eta': 0.1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'min_child_weight': 1,
            'tree_method': 'hist'
        }
        
        dtrain = xgb.DMatrix(
            self.prepare_features(train_features),
            label=train_labels
        )
        
        evals = [(dtrain, 'train')]
        if valid_features is not None and valid_labels is not None:
            dvalid = xgb.DMatrix(
                self.prepare_features(valid_features),
                label=valid_labels
            )
            evals.append((dvalid, 'valid'))
        
        self.model = xgb.train(
            params,
            dtrain,
            num_boost_round=500,
            evals=evals,
            early_stopping_rounds=20,
            verbose_eval=10
        )
        
        # Save model
        if model_path:
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            self.model.save_model(model_path)