import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
import networkx as nx
import numpy as np
from typing import Dict, List
import io
import base64

def plot_social_network(G: nx.Graph, 
                       target_user_id: int, 
                       recommendations: List[Dict]) -> str:
    """
    Plot the social network graph highlighting the target user, their friends,
    and recommended users.
    
    Returns:
        str: Base64 encoded PNG image
    """
    # Create a new figure
    fig = plt.figure(figsize=(12, 8))
    
    # Get recommended user IDs
    recommended_ids = [rec['user_id'] for rec in recommendations]
    
    # Get friends of target user
    friends = list(G.neighbors(target_user_id))
    
    # Create position layout
    pos = nx.spring_layout(G, k=1, iterations=50)
    
    # Draw all edges first
    nx.draw_networkx_edges(G, pos, alpha=0.2, edge_color='gray')
    
    # Draw different node groups
    # Other nodes (gray)
    other_nodes = [n for n in G.nodes() 
                   if n not in [target_user_id] + friends + recommended_ids]
    nx.draw_networkx_nodes(G, pos, nodelist=other_nodes, 
                          node_color='lightgray', node_size=300, alpha=0.5)
    
    # Friends (blue)
    if friends:
        nx.draw_networkx_nodes(G, pos, nodelist=friends,
                              node_color='royalblue', node_size=500)
    
    # Recommended users (green)
    if recommended_ids:
        nx.draw_networkx_nodes(G, pos, nodelist=recommended_ids,
                              node_color='limegreen', node_size=500)
    
    # Target user (red)
    nx.draw_networkx_nodes(G, pos, nodelist=[target_user_id],
                          node_color='red', node_size=700)
    
    # Add labels for important nodes
    labels = {}
    for node in [target_user_id] + friends + recommended_ids:
        labels[node] = G.nodes[node].get('display_name', str(node))
    nx.draw_networkx_labels(G, pos, labels, font_size=8)
    
    # Add legend
    plt.plot([], [], 'o', color='red', label='Target User', markersize=10)
    plt.plot([], [], 'o', color='royalblue', label='Friends', markersize=8)
    plt.plot([], [], 'o', color='limegreen', label='Recommended', markersize=8)
    plt.plot([], [], 'o', color='lightgray', label='Others', markersize=6)
    plt.legend()
    
    plt.title(f"Social Network Graph for User {target_user_id}")
    plt.axis('off')
    
    # Convert plot to base64 string
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=300)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def plot_similarity_heatmap(recommendations: List[Dict]) -> str:
    """
    Plot a heatmap of similarity scores for recommended users.
    
    Returns:
        str: Base64 encoded PNG image
    """
    # Create a new figure
    fig = plt.figure(figsize=(10, 6))
    
    # Prepare data for heatmap
    users = [rec['display_name'] for rec in recommendations]
    metrics = ['Common Neighbors', 'Jaccard', 'Adamic-Adar', 'Katz',
              'Interest Sim', 'Education Sim', 'Work Sim']
    
    data = []
    for rec in recommendations:
        row = [
            rec['graph_metrics']['common_neighbors'],
            rec['graph_metrics']['jaccard'],
            rec['graph_metrics']['adamic_adar'],
            rec['graph_metrics']['katz'],
            rec['feature_similarity']['interest_similarity'],
            rec['feature_similarity']['education_similarity'],
            rec['feature_similarity']['work_similarity']
        ]
        data.append(row)
    
    # Create heatmap
    sns.heatmap(data, annot=True, fmt='.2f', 
                xticklabels=metrics, 
                yticklabels=users,
                cmap='YlOrRd')
    
    plt.title('Similarity Scores for Recommended Users')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    # Convert plot to base64 string
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=300)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def plot_recommendation_scores(recommendations: List[Dict]) -> str:
    """
    Plot a bar chart of final recommendation scores.
    
    Returns:
        str: Base64 encoded PNG image
    """
    # Create a new figure
    fig = plt.figure(figsize=(10, 6))
    
    users = [rec['display_name'] for rec in recommendations]
    scores = [rec['score'] for rec in recommendations]
    
    # Create bar plot
    bars = plt.bar(users, scores)
    
    # Add value labels on top of bars
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.2f}',
                ha='center', va='bottom')
    
    plt.title('Final Recommendation Scores')
    plt.xlabel('Users')
    plt.ylabel('Score')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    # Convert plot to base64 string
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=300)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')