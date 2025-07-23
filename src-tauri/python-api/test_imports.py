#!/usr/bin/env python3
"""
Test script to verify that all imports work correctly after Pydantic v2 fixes
"""

try:
    print("Testing API imports...")
    
    # Test auth API
    from api.auth import router as auth_router
    print("✓ Auth API imported successfully")
    
    # Test users API
    from api.users import router as users_router, CreateUserRequest, UpdateUserRequest
    print("✓ Users API imported successfully")
    
    # Test models
    from models.user import User
    from models.auth_session import AuthSession, LoginAttempt, SecurityEvent
    print("✓ Models imported successfully")
    
    # Test utils
    from utils.auth import hash_password, verify_password, validate_password_complexity
    print("✓ Auth utils imported successfully")
    
    # Test Pydantic model validation
    test_user = CreateUserRequest(
        username="testuser",
        name="Test User",
        password="password123",
        role="cashier"
    )
    print("✓ Pydantic model validation works")
    
    print("\n🎉 All imports successful! API should start without errors.")
    
except Exception as e:
    print(f"❌ Import failed: {e}")
    import traceback
    traceback.print_exc()