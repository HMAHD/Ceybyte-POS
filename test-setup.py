#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                    Setup Test Script                                            ║
║                                                                                                  ║
║  Description: Test script to verify CeybytePOS development environment setup.                   ║
║               Checks API connectivity and system health.                                         ║
║                                                                                                  ║
║  Author: Ceybyte Development Team                                                                ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

import requests
import sys
import json

def test_api():
    """Test the Python FastAPI backend"""
    try:
        # Test root endpoint
        response = requests.get("http://127.0.0.1:8000/")
        print(f"✅ Root endpoint: {response.status_code} - {response.json()}")
        
        # Test health endpoint
        response = requests.get("http://127.0.0.1:8000/health")
        print(f"✅ Health endpoint: {response.status_code} - {response.json()}")
        
        return True
    except requests.exceptions.ConnectionError:
        print("❌ API not running. Start with: python src-tauri/python-api/main.py")
        return False
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def main():
    print("🧪 Testing CeybytePOS Setup")
    print("=" * 40)
    
    # Test API
    api_ok = test_api()
    
    print("\n📋 Setup Summary:")
    print(f"  Python API: {'✅ Working' if api_ok else '❌ Failed'}")
    
    if api_ok:
        print("\n🎉 Setup verification complete!")
        print("Ready to proceed with Task 2: Database Schema and Models")
    else:
        print("\n⚠️  Please fix the issues above before proceeding")
        sys.exit(1)

if __name__ == "__main__":
    main()