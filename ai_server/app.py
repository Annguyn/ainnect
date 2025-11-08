from flask import Flask, jsonify, request, render_template_string
from services.recommendation import RecommendationService
from utils.feature_store import FeatureStore
from config import *
import logging
import base64

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize services
rec_service = RecommendationService()
feature_store = FeatureStore()

@app.route('/api/recommendations/friends/<int:user_id>')
def get_friend_recommendations(user_id):
    try:
        # First, get debug info
        debug_info = feature_store.debug_data_status(user_id)
        logger.info(f"Debug info for user {user_id}: {debug_info}")
        
        # Check if user exists
        if not debug_info.get('user_exists'):
            return jsonify({
                'status': 'error',
                'message': f'User {user_id} not found',
                'debug_info': debug_info
            }), 404
        
        # Check if user has any features
        feature_stats = debug_info.get('feature_stats', {})
        if all(v == 0 for v in feature_stats.values()):
            logger.warning(f"User {user_id} has no features")
        
        # Get recommendations
        top_k = request.args.get('limit', default=2, type=int)
        recommendations = rec_service.get_recommendations(user_id, top_k)
        
        # Log recommendation stats
        logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")
        
        return jsonify({
            'status': 'success',
            'data': recommendations,
            'debug_info': debug_info
        })
    except Exception as e:
        logger.error(f"Error getting recommendations for user {user_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'debug_info': debug_info if 'debug_info' in locals() else None
        }), 500

@app.route('/api/recommendations/posts/<int:user_id>')
def get_post_recommendations(user_id):
    # TODO: Implement post recommendations using similar architecture
    pass

@app.route('/visualize/<int:user_id>')
def visualize_recommendations(user_id):
    try:
        # Get recommendations with visualizations
        recommendations = rec_service.get_recommendations(user_id)
        
        # Create HTML template with visualizations
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Recommendation Visualization for User {{ user_id }}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .container { max-width: 1200px; margin: 0 auto; }
                .visualization { margin: 20px 0; text-align: center; }
                img { max-width: 100%; height: auto; }
                .stats { 
                    background: #f5f5f5; 
                    padding: 15px; 
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .recommendations {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                .recommendation-card {
                    background: white;
                    border: 1px solid #ddd;
                    padding: 15px;
                    border-radius: 5px;
                }
                .score { font-weight: bold; color: #2196F3; }
                .reasons { color: #666; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Recommendation Visualization for User {{ user_id }}</h1>
                
                <!-- Graph Statistics -->
                <div class="stats">
                    <h2>Graph Statistics</h2>
                    <p><strong>Nodes:</strong> {{ recommendations.graph_stats.num_nodes }}</p>
                    <p><strong>Edges:</strong> {{ recommendations.graph_stats.num_edges }}</p>
                    <p><strong>Density:</strong> {{ "%.3f"|format(recommendations.graph_stats.density) }}</p>
                    <p><strong>Average Clustering:</strong> {{ "%.3f"|format(recommendations.graph_stats.avg_clustering) }}</p>
                </div>
                
                <!-- User Metrics -->
                <div class="stats">
                    <h2>User Metrics</h2>
                    <p><strong>Degree:</strong> {{ recommendations.user_metrics.degree }}</p>
                    <p><strong>Clustering:</strong> {{ "%.3f"|format(recommendations.user_metrics.clustering) }}</p>
                    <p><strong>PageRank:</strong> {{ "%.3f"|format(recommendations.user_metrics.pagerank) }}</p>
                </div>
                
                <!-- Network Visualization -->
                <div class="visualization">
                    <h2>Social Network Graph</h2>
                    <img src="data:image/png;base64,{{ recommendations.visualizations.network }}" 
                         alt="Social Network Graph">
                </div>
                
                <!-- Similarity Heatmap -->
                <div class="visualization">
                    <h2>Similarity Scores Heatmap</h2>
                    <img src="data:image/png;base64,{{ recommendations.visualizations.similarity }}"
                         alt="Similarity Heatmap">
                </div>
                
                <!-- Recommendation Scores -->
                <div class="visualization">
                    <h2>Final Recommendation Scores</h2>
                    <img src="data:image/png;base64,{{ recommendations.visualizations.scores }}"
                         alt="Recommendation Scores">
                </div>
                
                <!-- Recommendations -->
                <h2>Recommended Users</h2>
                <div class="recommendations">
                    {% for rec in recommendations.recommendations %}
                    <div class="recommendation-card">
                        <h3>{{ rec.display_name }}</h3>
                        <p class="score">Score: {{ "%.3f"|format(rec.score) }}</p>
                        <div class="reasons">
                            <p><strong>Reasons:</strong></p>
                            <ul>
                                {% for reason in rec.recommendation_reasons %}
                                <li>{{ reason }}</li>
                                {% endfor %}
                            </ul>
                        </div>
                    </div>
                    {% endfor %}
                </div>
            </div>
        </body>
        </html>
        """
        
        return render_template_string(html_template, 
                                    user_id=user_id,
                                    recommendations=recommendations)
                                    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/')
def home():
    return "ainnect ai recommendation system"

if __name__ == '__main__':
    app.run(debug=True)