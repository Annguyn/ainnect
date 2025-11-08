import networkx as nx
import numpy as np
from typing import Dict, List, Set, Tuple
import math

class GraphMetrics:
    def __init__(self, graph: nx.Graph):
        self.graph = graph
        # Cache cho các tính toán phổ biến
        self._degree_dict = None
        self._neighbors_dict = None
        
    def _init_cache(self):
        """Initialize cache for common computations"""
        if self._degree_dict is None:
            self._degree_dict = dict(self.graph.degree())
        if self._neighbors_dict is None:
            self._neighbors_dict = {node: set(self.graph.neighbors(node)) 
                                  for node in self.graph.nodes()}
    
    def get_graph_stats(self) -> Dict:
        """Get basic graph statistics"""
        stats = {
            'num_nodes': self.graph.number_of_nodes(),
            'num_edges': self.graph.number_of_edges(),
            'density': nx.density(self.graph),
            'avg_clustering': nx.average_clustering(self.graph),
            'avg_degree': sum(dict(self.graph.degree()).values()) / self.graph.number_of_nodes()
        }
        
        # Connected components
        components = list(nx.connected_components(self.graph))
        stats['num_components'] = len(components)
        stats['largest_component_size'] = len(max(components, key=len))
        
        return stats
    
    def get_node_metrics(self, node: int) -> Dict:
        """Get node-level metrics"""
        self._init_cache()
        
        metrics = {
            'degree': self._degree_dict[node],
            'clustering': nx.clustering(self.graph, node),
            'eigenvector_centrality': nx.eigenvector_centrality_numpy(self.graph)[node],
            'betweenness_centrality': nx.betweenness_centrality(self.graph)[node],
            'pagerank': nx.pagerank(self.graph)[node]
        }
        return metrics
    
    def get_common_neighbors(self, u: int, v: int) -> Set[int]:
        """Get common neighbors between two nodes"""
        self._init_cache()
        return self._neighbors_dict[u] & self._neighbors_dict[v]
    
    def common_neighbors_index(self, u: int, v: int) -> int:
        """Calculate Common Neighbors index"""
        return len(self.get_common_neighbors(u, v))
    
    def jaccard_coefficient(self, u: int, v: int) -> float:
        """Calculate Jaccard Coefficient"""
        self._init_cache()
        neighbors_u = self._neighbors_dict[u]
        neighbors_v = self._neighbors_dict[v]
        
        intersection = len(neighbors_u & neighbors_v)
        union = len(neighbors_u | neighbors_v)
        
        return intersection / union if union > 0 else 0
    
    def adamic_adar_index(self, u: int, v: int) -> float:
        """Calculate Adamic-Adar index"""
        self._init_cache()
        common_neighbors = self.get_common_neighbors(u, v)
        
        aa_score = 0
        for neighbor in common_neighbors:
            # Score is sum of 1/log(degree) for each common neighbor
            degree = self._degree_dict[neighbor]
            if degree > 1:  # Avoid log(1) = 0
                aa_score += 1.0 / math.log(degree)
                
        return aa_score
    
    def katz_index(self, u: int, v: int, beta: float = 0.1, max_length: int = 3) -> float:
        """
        Calculate Katz index between two nodes
        beta: damping factor
        max_length: maximum path length to consider
        """
        score = 0
        # Get all paths between u and v up to max_length
        for length in range(1, max_length + 1):
            num_paths = 0
            for path in nx.all_simple_paths(self.graph, u, v, cutoff=length):
                num_paths += 1
            score += (beta ** length) * num_paths
        return score
    
    def predict_links(self, 
                     source_node: int, 
                     excluded_nodes: Set[int] = None,
                     top_k: int = 5,
                     weights: Dict[str, float] = None) -> List[Tuple[int, Dict[str, float]]]:
        """
        Predict most likely links for a node using multiple metrics
        
        Args:
            source_node: Node to predict links for
            excluded_nodes: Nodes to exclude (e.g., existing friends)
            top_k: Number of predictions to return
            weights: Dictionary of weights for different metrics
                    Default: CN=0.3, JC=0.2, AA=0.3, Katz=0.2
        
        Returns:
            List of (node_id, scores_dict) tuples
        """
        if excluded_nodes is None:
            excluded_nodes = set()
            
        if weights is None:
            weights = {
                'cn': 0.3,
                'jc': 0.2,
                'aa': 0.3,
                'katz': 0.2
            }
            
        candidates = []
        for target_node in self.graph.nodes():
            if target_node == source_node or target_node in excluded_nodes:
                continue
                
            # Calculate all metrics
            scores = {
                'cn': self.common_neighbors_index(source_node, target_node),
                'jc': self.jaccard_coefficient(source_node, target_node),
                'aa': self.adamic_adar_index(source_node, target_node),
                'katz': self.katz_index(source_node, target_node)
            }
            
            # Normalize CN score by maximum degree
            max_degree = max(self._degree_dict.values())
            scores['cn'] = scores['cn'] / max_degree
            
            # Calculate weighted score
            weighted_score = sum(weights[metric] * score 
                               for metric, score in scores.items())
            
            candidates.append((target_node, {
                'total_score': weighted_score,
                'metrics': scores
            }))
        
        # Sort by total score and return top-k
        candidates.sort(key=lambda x: x[1]['total_score'], reverse=True)
        return candidates[:top_k]
