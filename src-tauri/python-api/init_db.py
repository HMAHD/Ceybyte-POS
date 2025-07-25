#!/usr/bin/env python3
"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                Database Initialization Script                                    │
│                                                                                                  │
│  Description: Initialize the database with tables and default data.                              │
│               Run this script to set up the database for the first time.                         │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import all models first to register them
from models import *
from database.connection import init_database, engine
from database.base import Base

def main():
    """Initialize the database"""
    try:
        print("🚀 Initializing CeybytePOS Database...")
        print(f"📁 Database location: {engine.url}")
        
        # Initialize database with all tables and default data
        init_database()
        
        print("✅ Database initialized successfully!")
        print("\n📊 Database Tables Created:")
        
        # List all created tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        for table in sorted(tables):
            print(f"   • {table}")
        
        print(f"\n🎯 Total tables created: {len(tables)}")
        print("\n🔧 Default data inserted:")
        print("   • Admin user (username: admin, password: admin123, PIN: 1234)")
        print("   • Owner user (username: owner, password: owner123, PIN: 1111)")
        print("   • Cashier user (username: cashier, password: cashier123, PIN: 2345)")
        print("   • Helper user (username: helper, password: helper123, PIN: 3456)")
        print("   • Default units of measure")
        print("   • System settings")
        print("   • Sri Lankan festival calendar")
        
        print("\n🎉 Database setup complete! You can now start the application.")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()