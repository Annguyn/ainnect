import mysql.connector
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

class DatabaseConnection:
    def __init__(self):
        self.connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            use_unicode=True
        )
        self.cursor = None

    def __enter__(self):
        self.cursor = self.connection.cursor(dictionary=True)
        return self.cursor

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()

def get_db_connection():
    return DatabaseConnection()