
import os
from pathlib import Path

import mysql.connector
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv(Path(__file__).resolve().parent / ".env")


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME", "inkloom_db"),
            port=int(os.getenv("DB_PORT", "3306"))
        )

        return connection

    except mysql.connector.Error as error:
        print("Database connection failed:", error)
        return None
