#!/usr/bin/env python3
"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  PIN Authentication Setup                                        │
│                                                                                                  │
│  Description: Setup script for PIN-based authentication system.                                  │
│               Runs database migrations and creates default users.                                │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import sys
import os

# Add the Python API directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src-tauri', 'python-api'))

from migrations.add_pin_sessions import run_migration

def main():
    print("🚀 Setting up PIN Authentication System...")
    print("=" * 50)
    
    try:
        # Run the migration
        run_migration()
        
        print("\n✅ PIN Authentication Setup Complete!")
        print("\n📋 Default Users Created:")
        print("   Username: owner    | PIN: 1234 | Role: Owner")
        print("   Username: cashier  | PIN: 5678 | Role: Cashier")
        print("\n🔐 Security Note:")
        print("   Please change default PINs after first login!")
        print("\n🎯 Next Steps:")
        print("   1. Start the Python API: python src-tauri/python-api/main.py")
        print("   2. Start the frontend: pnpm run dev")
        print("   3. Login with the default credentials above")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()