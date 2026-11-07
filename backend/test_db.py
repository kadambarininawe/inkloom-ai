
from database import get_db_connection

connection = get_db_connection()

if connection:
    print("INKLOOM MySQL connection successful!")
    print("Database:", connection.database)
    connection.close()
else:
    print("Could not connect to MySQL.")
