from sqlalchemy import text
from app.database import engine

def update_db():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE patients ADD COLUMN height VARCHAR(20);"))
            print("Added height column")
        except Exception as e:
            print(f"Error adding height: {e}")
            
        try:
            conn.execute(text("ALTER TABLE patients ADD COLUMN weight VARCHAR(20);"))
            print("Added weight column")
        except Exception as e:
            print(f"Error adding weight: {e}")
            
        try:
            conn.execute(text("ALTER TABLE patients ADD COLUMN ayush_status VARCHAR(50);"))
            print("Added ayush_status column")
        except Exception as e:
            print(f"Error adding ayush_status: {e}")
        
        conn.commit()

if __name__ == "__main__":
    update_db()
