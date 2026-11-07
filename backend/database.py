import os
from pathlib import Path
import mysql.connector
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")


def get_db_connection():
    try:
        host = os.getenv("DB_HOST", "localhost")

        config = {
            "host": host,
            "user": os.getenv("DB_USER"),
            "password": os.getenv("DB_PASSWORD"),
            "database": os.getenv("DB_NAME", "inkloom_db"),
            "port": int(os.getenv("DB_PORT", "3306"))
        }

        # Secure TLS connection for cloud database
        if host != "localhost" and host != "127.0.0.1":
            config.update({
                "ssl_ca": "/etc/ssl/certs/ca-certificates.crt",
                "ssl_verify_cert": True,
                "ssl_verify_identity": True
            })

        return mysql.connector.connect(**config)

    except mysql.connector.Error as error:
        print("Database connection failed:", error)
        return None