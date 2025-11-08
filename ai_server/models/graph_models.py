import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import networkx as nx
from typing import Dict, List, Tuple, Set
from scipy.sparse import csr_matrix
import faiss

class LightGCN(nn.Module):
    def __init__(self, num_users: int, num_items: int, embedding_dim: int = 64, num_layers: int = 3):
        super().__init__()
        self.num_users = num_users
        self.num_items = num_items
        self.embedding_dim = embedding_dim
        self.num_layers = num_layers
        
        # Initialize embeddings
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.item_embedding = nn.Embedding(num_items, embedding_dim)
        
        # Xavier initialization
        nn.init.xavier_uniform_(self.user_embedding.weight)
        nn.init.xavier_uniform_(self.item_embedding.weight)
        
    def forward(self, adj_matrix: csr_matrix) -> Tuple[torch.Tensor, torch.Tensor]:
        # Convert sparse matrix to torch
        indices = torch.LongTensor(np.vstack((adj_matrix.row, adj_matrix.col)))
        values = torch.FloatTensor(adj_matrix.data)
        shape = adj_matrix.shape
        adj_matrix = torch.sparse_coo_tensor(indices, values, shape)
        
        # Get initial embeddings
        users_emb = self.user_embedding.weight
        items_emb = self.item_embedding.weight
        all_emb = torch.cat([users_emb, items_emb])
        
        # Layer propagation
        embs = [all_emb]
        for layer in range(self.num_layers):
            all_emb = torch.sparse.mm(adj_matrix, all_emb)
            embs.append(all_emb)
        
        embs = torch.stack(embs, dim=1)
        out = torch.mean(embs, dim=1)
        
        users, items = torch.split(out, [self.num_users, self.num_items])
        return users, items

def personalized_pagerank(graph: nx.Graph, 
                         source: int,
                         alpha: float = 0.85,
                         max_iter: int = 100,
                         tol: float = 1e-6) -> Dict[int, float]:
    """
    Compute Personalized PageRank scores for a given source node
    """
    if not graph.has_node(source):
        return {}
        
    # Initialize PPR scores
    ppr = {node: 0.0 for node in graph.nodes()}
    ppr[source] = 1.0
    
    # Power iteration
    for _ in range(max_iter):
        prev_ppr = ppr.copy()
        
        # Random walk with restart
        for node in graph.nodes():
            neighbors = list(graph.neighbors(node))
            if not neighbors:  # Skip if no neighbors
                continue
                
            if node == source:
                # Teleport probability + sum of incoming scores
                ppr[node] = (1 - alpha) + alpha * sum(
                    prev_ppr[pred] / len(list(graph.neighbors(pred)))
                    for pred in graph.neighbors(node)
                )
            else:
                # Sum of incoming scores
                ppr[node] = alpha * sum(
                    prev_ppr[pred] / len(list(graph.neighbors(pred)))
                    for pred in graph.neighbors(node)
                )
        
        # Check convergence
        err = sum(abs(ppr[node] - prev_ppr[node]) for node in graph.nodes())
        if err < tol:
            break
    
    return ppr

def get_graph_candidates(graph: nx.Graph,
                        user_id: int,
                        existing_friends: Set[int],
                        top_k: int = 300) -> List[Tuple[int, float]]:
    """
    Get candidate recommendations using graph algorithms
    """
    try:
        # Get 2-hop neighbors
        two_hop = set()
        if graph.has_node(user_id):
            for friend in graph.neighbors(user_id):
                if friend not in existing_friends:
                    two_hop.update(graph.neighbors(friend))
        two_hop = two_hop - existing_friends - {user_id}
        
        # Compute PPR scores
        ppr_scores = personalized_pagerank(graph, user_id)
        
        # Score candidates using PPR and common neighbors
        candidates = []
        for candidate in two_hop:
            # Common neighbors score
            cn_score = len(
                set(graph.neighbors(user_id)) & 
                set(graph.neighbors(candidate))
            ) if graph.has_node(candidate) else 0
            
            # PPR score
            ppr_score = ppr_scores.get(candidate, 0)
            
            # Combined score
            score = 0.7 * ppr_score + 0.3 * (cn_score / (max(cn_score, 1)))
            candidates.append((candidate, score))
        
        # Sort and return top-k
        candidates.sort(key=lambda x: x[1], reverse=True)
        return candidates[:top_k]
        
    except Exception as e:
        print(f"Error in get_graph_candidates: {str(e)}")
        return []