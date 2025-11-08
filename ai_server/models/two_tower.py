import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Tuple

class Tower(nn.Module):
    def __init__(self, in_dim: int, emb_dim: int = 128):
        super().__init__()
        self.mlp = nn.Sequential(
            nn.Linear(in_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, emb_dim)
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return F.normalize(self.mlp(x), dim=-1)

class TwoTowerModel(nn.Module):
    def __init__(self, user_feat_dim: int, item_feat_dim: int, emb_dim: int = 128):
        super().__init__()
        self.user_tower = Tower(user_feat_dim, emb_dim)
        self.item_tower = Tower(item_feat_dim, emb_dim)
    
    def forward(self, 
                user_features: torch.Tensor,
                pos_item_features: torch.Tensor,
                neg_item_features: torch.Tensor = None) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        user_emb = self.user_tower(user_features)
        pos_emb = self.item_tower(pos_item_features)
        
        if neg_item_features is not None:
            neg_emb = self.item_tower(neg_item_features)
            return user_emb, pos_emb, neg_emb
        
        return user_emb, pos_emb, None
    
    def get_user_embedding(self, user_features: torch.Tensor) -> torch.Tensor:
        return self.user_tower(user_features)
    
    def get_item_embedding(self, item_features: torch.Tensor) -> torch.Tensor:
        return self.item_tower(item_features)

def info_nce_loss(user_emb: torch.Tensor, 
                  pos_emb: torch.Tensor, 
                  neg_emb: torch.Tensor,
                  temperature: float = 0.1) -> torch.Tensor:
    """InfoNCE loss for contrastive learning"""
    pos_logits = torch.sum(user_emb * pos_emb, dim=-1) / temperature
    neg_logits = torch.matmul(user_emb, neg_emb.t()) / temperature
    
    logits = torch.cat([pos_logits.unsqueeze(-1), neg_logits], dim=-1)
    labels = torch.zeros(len(user_emb), dtype=torch.long, device=user_emb.device)
    
    return F.cross_entropy(logits, labels)
