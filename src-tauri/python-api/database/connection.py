"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  Database Connection Manager                                     │
│                                                                                                  │
│  Description: Database connection configuration and session management.                          │
│               Handles SQLite connection with WAL mode for multi-terminal support.                │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import Engine
import sqlite3

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ceybyte_pos.db")
DATABASE_ECHO = os.getenv("DATABASE_ECHO", "false").lower() == "true"

# Create SQLite engine with optimizations for multi-terminal access
engine = create_engine(
    DATABASE_URL,
    echo=DATABASE_ECHO,
    connect_args={
        "check_same_thread": False,  # Allow multi-threading
        "timeout": 30,  # 30 second timeout for database locks
    },
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections every hour
)


@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Configure SQLite for optimal multi-terminal performance"""
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        
        # Enable WAL mode for better concurrent access
        cursor.execute("PRAGMA journal_mode=WAL")
        
        # Set synchronous mode to NORMAL for better performance
        cursor.execute("PRAGMA synchronous=NORMAL")
        
        # Enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys=ON")
        
        # Set busy timeout for handling locks
        cursor.execute("PRAGMA busy_timeout=30000")
        
        # Optimize cache size (negative value = KB)
        cursor.execute("PRAGMA cache_size=-64000")  # 64MB cache
        
        # Enable memory-mapped I/O
        cursor.execute("PRAGMA mmap_size=268435456")  # 256MB
        
        cursor.close()


# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_database():
    """Initialize database with all tables"""
    from database.base import Base
    import models  # This will import all models and register them
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Insert default data
    _insert_default_data()


def _insert_default_data():
    """Insert default system data"""
    db = SessionLocal()
    try:
        from models.user import User
        from models.unit_of_measure import UnitOfMeasure
        from models.setting import Setting
        from models.festival_calendar import FestivalCalendar
        from datetime import datetime, date
        
        # Create default users if not exist
        from utils.auth import hash_password
        
        # Default admin user
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                name="Administrator",
                role="owner",
                password_hash=hash_password("AdminPass2025!"),
                pin="1234",
                is_active=True
            )
            db.add(admin_user)
        
        # Default cashier user
        cashier_user = db.query(User).filter(User.username == "cashier").first()
        if not cashier_user:
            cashier_user = User(
                username="cashier",
                name="Cashier User",
                role="cashier",
                password_hash=hash_password("CashierPass2025!"),
                pin="2345",
                is_active=True
            )
            db.add(cashier_user)
        
        # Default helper user
        helper_user = db.query(User).filter(User.username == "helper").first()
        if not helper_user:
            helper_user = User(
                username="helper",
                name="Helper User",
                role="helper",
                password_hash=hash_password("HelperPass2025!"),
                pin="3456",
                is_active=True
            )
            db.add(helper_user)
        
        # Create default units of measure
        default_units = [
            {"name": "Pieces", "abbreviation": "pcs", "allow_decimals": False, "decimal_places": 0},
            {"name": "Kilograms", "abbreviation": "kg", "allow_decimals": True, "decimal_places": 3},
            {"name": "Grams", "abbreviation": "g", "allow_decimals": True, "decimal_places": 2},
            {"name": "Liters", "abbreviation": "L", "allow_decimals": True, "decimal_places": 2},
            {"name": "Milliliters", "abbreviation": "ml", "allow_decimals": True, "decimal_places": 0},
            {"name": "Meters", "abbreviation": "m", "allow_decimals": True, "decimal_places": 2},
        ]
        
        for unit_data in default_units:
            existing_unit = db.query(UnitOfMeasure).filter(
                UnitOfMeasure.abbreviation == unit_data["abbreviation"]
            ).first()
            if not existing_unit:
                unit = UnitOfMeasure(**unit_data)
                db.add(unit)
        
        # Create default settings
        default_settings = [
            {"key": "business_name", "value": "CeybytePOS Store", "category": "business"},
            {"key": "business_address", "value": "Colombo, Sri Lanka", "category": "business"},
            {"key": "business_phone", "value": "+94 11 234 5678", "category": "business"},
            {"key": "business_email", "value": "info@ceybyte.com", "category": "business"},
            {"key": "default_currency", "value": "LKR", "category": "system"},
            {"key": "default_language", "value": "en", "category": "system"},
            {"key": "receipt_width_mm", "value": "80", "category": "printing"},
            {"key": "receipt_chars_per_line", "value": "32", "category": "printing"},
            {"key": "auto_backup_enabled", "value": "true", "category": "backup"},
            {"key": "backup_interval_hours", "value": "24", "category": "backup"},
        ]
        
        for setting_data in default_settings:
            existing_setting = db.query(Setting).filter(
                Setting.key == setting_data["key"]
            ).first()
            if not existing_setting:
                setting = Setting(**setting_data)
                db.add(setting)
        
        # Add Sri Lankan festival calendar data
        current_year = datetime.now().year
        festivals = [
            {"name": "New Year's Day", "date": date(current_year, 1, 1), "year": current_year, "type": "public_holiday", "is_public_holiday": True},
            {"name": "Independence Day", "date": date(current_year, 2, 4), "year": current_year, "type": "public_holiday", "is_public_holiday": True},
            {"name": "Sinhala & Tamil New Year", "date": date(current_year, 4, 13), "year": current_year, "type": "public_holiday", "is_public_holiday": True},
            {"name": "Sinhala & Tamil New Year", "date": date(current_year, 4, 14), "year": current_year, "type": "public_holiday", "is_public_holiday": True},
            {"name": "Labour Day", "date": date(current_year, 5, 1), "year": current_year, "type": "public_holiday", "is_public_holiday": True},
            {"name": "Vesak Day", "date": date(current_year, 5, 23), "year": current_year, "type": "poya_day", "is_poya_day": True, "is_public_holiday": True},
            {"name": "Christmas Day", "date": date(current_year, 12, 25), "year": current_year, "type": "public_holiday", "is_public_holiday": True},
        ]
        
        for festival_data in festivals:
            existing_festival = db.query(FestivalCalendar).filter(
                FestivalCalendar.date == festival_data["date"],
                FestivalCalendar.name == festival_data["name"]
            ).first()
            if not existing_festival:
                festival = FestivalCalendar(**festival_data)
                db.add(festival)
        
        db.commit()
        
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()