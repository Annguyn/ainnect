import os
from dotenv import load_dotenv

load_dotenv()

# Database
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'annguyen199')
DB_NAME = os.getenv('DB_NAME', 'ainnect')

# Redis
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))

# Model configs
EMBEDDING_DIM = 128
TWO_TOWER_BATCH_SIZE = 256
FAISS_NLIST = 4096  # Number of clusters for IVF
FAISS_M = 32  # Number of subquantizers for PQ
TOP_K_RETRIEVAL = 1000  # Total candidates to retrieve
TOP_K_FINAL = 20  # Final recommendations to return

# Cache TTLs (in seconds)
USER_EMBEDDING_TTL = 3600  # 1 hour
RECOMMENDATIONS_TTL = 1800  # 30 minutes

# Feature computation
INTERACTION_WINDOW_DAYS = 30
PPR_HUB_THRESHOLD = 1000  # Minimum degree for precomputing PPR
