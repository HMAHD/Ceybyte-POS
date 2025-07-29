"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  PIN Sessions Migration                                          │
│                                                                                                  │
│  Description: Database migration to add PIN sessions table for fast authentication.              │
│               Creates the new table and migrates existing users to PIN format.                   │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import create_engine, text
from database.connection import DATABASE_URL
import hashlib

def hash_pin(pin: str) -> str:
    """Hash PIN using SHA-256"""
    return hashlib.sha256(pin.encode()).hexdigest()

def run_migration():
    """Run the PIN sessions migration"""
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Create pin_sessions table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS pin_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    display_name VARCHAR(100) NOT NULL,
                    pin_hash VARCHAR(64) NOT NULL,
                    role VARCHAR(20) NOT NULL DEFAULT 'cashier',
                    last_used DATETIME,
                    session_start DATETIME,
                    preferred_language VARCHAR(5) DEFAULT 'en',
                    has_account BOOLEAN DEFAULT FALSE,
                    email VARCHAR(100),
                    phone VARCHAR(20),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
        
        # Create index for faster lookups
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_pin_sessions_username 
            ON pin_sessions(username)
        """))
        
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_pin_sessions_user_id 
            ON pin_sessions(user_id)
        """))
        
        # Migrate existing users from users table if it exists
        try:
            result = conn.execute(text("""
                SELECT id, username, name, role, preferred_language, email, phone
                FROM users 
                WHERE is_active = TRUE
            """))
            
            existing_users = result.fetchall()
            
            for user in existing_users:
                # Check if PIN session already exists
                existing_pin = conn.execute(text("""
                    SELECT id FROM pin_sessions WHERE username = :username
                """), {"username": user.username}).fetchone()
                
                if not existing_pin:
                    # Create PIN session with default PIN (user should change it)
                    default_pin = "1234" if user.role == "owner" else "5678"
                    pin_hash = hash_pin(default_pin)
                    
                    conn.execute(text("""
                        INSERT INTO pin_sessions (
                            user_id, username, display_name, pin_hash, role,
                            preferred_language, has_account, email, phone,
                            session_start, last_used
                        ) VALUES (
                            :user_id, :username, :display_name, :pin_hash, :role,
                            :preferred_language, :has_account, :email, :phone,
                            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                        )
                    """), {
                        "user_id": user.id,
                        "username": user.username,
                        "display_name": user.name,
                        "pin_hash": pin_hash,
                        "role": user.role,
                        "preferred_language": user.preferred_language or "en",
                        "has_account": bool(user.email),
                        "email": user.email,
                        "phone": user.phone
                    })
                    
                    print(f"Migrated user: {user.username} (default PIN: {default_pin})")
        
        except Exception as e:
            print(f"No existing users table or migration error: {e}")
        
        # Create default users if none exist
        existing_count = conn.execute(text("""
            SELECT COUNT(*) as count FROM pin_sessions WHERE is_active = TRUE
        """)).fetchone()
        
        if existing_count.count == 0:
            default_users = [
                {
                    "user_id": 1,
                    "username": "owner",
                    "display_name": "Owner",
                    "pin": "1234",
                    "role": "owner"
                },
                {
                    "user_id": 2,
                    "username": "cashier",
                    "display_name": "Cashier",
                    "pin": "5678",
                    "role": "cashier"
                }
            ]
            
            for user_data in default_users:
                conn.execute(text("""
                    INSERT INTO pin_sessions (
                        user_id, username, display_name, pin_hash, role,
                        session_start, last_used
                    ) VALUES (
                        :user_id, :username, :display_name, :pin_hash, :role,
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """), {
                    "user_id": user_data["user_id"],
                    "username": user_data["username"],
                    "display_name": user_data["display_name"],
                    "pin_hash": hash_pin(user_data["pin"]),
                    "role": user_data["role"]
                })
                
                print(f"Created default user: {user_data['username']} (PIN: {user_data['pin']})")
        
            conn.commit()
            print("PIN sessions migration completed successfully!")
    
    except Exception as e:
        print(f"Migration error: {e}")
        # Don't fail completely, just log the error
        pass

if __name__ == "__main__":
    run_migration()