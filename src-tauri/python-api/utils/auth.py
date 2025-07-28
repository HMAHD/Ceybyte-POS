"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   Authentication Utilities                                       │
│                                                                                                  │
│  Description: JWT-based authentication system with role management for CeybytePOS.               │
│               Supports username/password and PIN-based authentication with user roles.           │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from models.user import User
from database.connection import SessionLocal

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "ceybyte-pos-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours for POS system

# User roles and permissions
USER_ROLES = {
    "admin": {
        "name": "Administrator",
        "permissions": [
            "dashboard", "sales", "inventory", "customers", "suppliers", "reports", 
            "settings", "users", "backup", "system", "admin"
        ]
    },
    "owner": {
        "name": "Owner",
        "permissions": [
            "dashboard", "sales", "inventory", "customers", "suppliers", "reports", 
            "settings", "users", "backup", "system", "admin"
        ]
    },
    "cashier": {
        "name": "Cashier", 
        "permissions": [
            "dashboard", "sales", "inventory", "customers", "reports"
        ]
    },
    "helper": {
        "name": "Helper",
        "permissions": [
            "dashboard", "sales"
        ]
    }
}


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def authenticate_user(username: str, password: str) -> Optional[User]:
    """Authenticate user with username and password"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(
            User.username == username,
            User.is_active == True
        ).first()
        
        if not user:
            return None
            
        if not verify_password(password, user.password_hash):
            return None
            
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Refresh the user object to ensure all attributes are loaded
        db.refresh(user)
        
        # Detach the user from the session so it can be used outside
        db.expunge(user)
        
        return user
        
    finally:
        db.close()


def authenticate_user_pin(username: str, pin: str) -> Optional[User]:
    """Authenticate user with username and PIN (for quick switching)"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(
            User.username == username,
            User.pin == pin,
            User.is_active == True
        ).first()
        
        if not user:
            return None
            
        # Update last activity
        user.last_activity = datetime.utcnow()
        db.commit()
        
        # Refresh the user object to ensure all attributes are loaded
        db.refresh(user)
        
        # Detach the user from the session so it can be used outside
        db.expunge(user)
        
        return user
        
    finally:
        db.close()


def get_user_permissions(role: str) -> list:
    """Get permissions for user role"""
    return USER_ROLES.get(role, {}).get("permissions", [])


def check_permission(user_role: str, required_permission: str) -> bool:
    """Check if user role has required permission"""
    user_permissions = get_user_permissions(user_role)
    return required_permission in user_permissions


def create_user_token(user: User) -> Dict[str, Any]:
    """Create token data for user"""
    token_data = {
        "sub": str(user.id),
        "username": user.username,
        "name": user.name,
        "role": user.role,
        "permissions": get_user_permissions(user.role)
    }
    
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # seconds
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "permissions": get_user_permissions(user.role),
            "preferred_language": user.preferred_language
        }
    }


def get_current_user_from_token(token: str) -> Optional[User]:
    """Get current user from JWT token"""
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            return None
            
        db = SessionLocal()
        try:
            user = db.query(User).filter(
                User.id == int(user_id),
                User.is_active == True
            ).first()
            return user
        finally:
            db.close()
            
    except HTTPException:
        return None


def require_permission(required_permission: str):
    """Decorator to require specific permission"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # This would be used with FastAPI dependency injection
            # Implementation depends on how we structure the API endpoints
            return func(*args, **kwargs)
        return wrapper
    return decorator


from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """FastAPI dependency to get current user from JWT token"""
    try:
        token = credentials.credentials
        payload = verify_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
            
        db = SessionLocal()
        try:
            user = db.query(User).filter(
                User.id == int(user_id),
                User.is_active == True
            ).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
                
            return user
        finally:
            db.close()
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )