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
import secrets
import json
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from fastapi import HTTPException, status, Request
from models.user import User
from models.auth_session import AuthSession, LoginAttempt, SecurityEvent
from database.connection import SessionLocal
from sqlalchemy import and_, desc

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "ceybyte-pos-secret-key-change-in-production")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", "ceybyte-pos-refresh-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours for POS system
REFRESH_TOKEN_EXPIRE_DAYS = 30  # 30 days for refresh token

# Brute force protection
MAX_LOGIN_ATTEMPTS = 5  # Maximum failed attempts before lockout
LOCKOUT_DURATION_MINUTES = 15  # Lockout duration after max attempts
ATTEMPT_WINDOW_MINUTES = 60  # Time window for counting attempts

# Password complexity rules
PASSWORD_MIN_LENGTH = 6  # Minimum password length for Sri Lankan business context
PASSWORD_COMPLEXITY_RULES = {
    "min_length": PASSWORD_MIN_LENGTH,
    "require_uppercase": False,  # Relaxed for Sri Lankan businesses
    "require_lowercase": False,
    "require_numbers": False,
    "require_special_chars": False,
    "common_passwords": [  # Common Sri Lankan passwords to block
        "123456", "password", "admin123", "ceybyte", "admin", "user", 
        "srilanka", "colombo", "kandy", "galle", "hello", "welcome"
    ]
}

# User roles and permissions
USER_ROLES = {
    "owner": {
        "name": "Owner",
        "permissions": [
            "sales", "inventory", "customers", "suppliers", "reports", 
            "settings", "users", "backup", "system", "admin"
        ]
    },
    "cashier": {
        "name": "Cashier", 
        "permissions": [
            "sales", "inventory", "customers", "basic_reports"
        ]
    },
    "helper": {
        "name": "Helper",
        "permissions": [
            "sales"
        ]
    }
}


def validate_password_complexity(password: str) -> Tuple[bool, str]:
    """Validate password against complexity rules"""
    rules = PASSWORD_COMPLEXITY_RULES
    
    # Check minimum length
    if len(password) < rules["min_length"]:
        return False, f"Password must be at least {rules['min_length']} characters long"
    
    # Check for common passwords
    if password.lower() in [p.lower() for p in rules["common_passwords"]]:
        return False, "Password is too common. Please choose a more secure password"
    
    # Check uppercase requirement (if enabled)
    if rules.get("require_uppercase", False) and not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    # Check lowercase requirement (if enabled)
    if rules.get("require_lowercase", False) and not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    # Check numbers requirement (if enabled)
    if rules.get("require_numbers", False) and not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    
    # Check special characters requirement (if enabled)
    if rules.get("require_special_chars", False):
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(c in special_chars for c in password):
            return False, "Password must contain at least one special character"
    
    return True, "Password meets complexity requirements"


def hash_password(password: str) -> str:
    """Hash password using bcrypt with complexity validation"""
    # Validate password complexity first
    is_valid, message = validate_password_complexity(password)
    if not is_valid:
        raise ValueError(message)
    
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
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire, 
        "iat": datetime.now(timezone.utc), 
        "type": "refresh",
        "jti": secrets.token_urlsafe(32)  # Unique token ID for revocation
    })
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
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
    except jwt.JWTError:
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


def log_security_event(
    event_type: str, 
    user_id: Optional[int] = None, 
    session_id: Optional[int] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    terminal_id: Optional[str] = None,
    description: Optional[str] = None,
    severity: str = "info",
    metadata: Optional[Dict] = None
):
    """Log security event for audit trail"""
    db = SessionLocal()
    try:
        event = SecurityEvent(
            event_type=event_type,
            event_description=description,
            severity=severity,
            user_id=user_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            terminal_id=terminal_id,
            event_metadata=json.dumps(metadata) if metadata else None
        )
        db.add(event)
        db.commit()
    finally:
        db.close()


def log_login_attempt(
    username: str, 
    success: bool, 
    ip_address: str,
    user_agent: Optional[str] = None,
    terminal_id: Optional[str] = None,
    failure_reason: Optional[str] = None
):
    """Log login attempt for brute force tracking"""
    db = SessionLocal()
    try:
        attempt = LoginAttempt(
            username=username,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            failure_reason=failure_reason,
            terminal_id=terminal_id
        )
        db.add(attempt)
        db.commit()
    finally:
        db.close()


def check_brute_force_protection(username: str, ip_address: str) -> bool:
    """Check if user/IP is blocked due to too many failed attempts"""
    db = SessionLocal()
    try:
        # Check recent failed attempts
        cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=ATTEMPT_WINDOW_MINUTES)
        
        failed_attempts = db.query(LoginAttempt).filter(
            and_(
                LoginAttempt.username == username,
                LoginAttempt.ip_address == ip_address,
                LoginAttempt.success == False,
                LoginAttempt.attempted_at > cutoff_time
            )
        ).count()
        
        return failed_attempts >= MAX_LOGIN_ATTEMPTS
        
    finally:
        db.close()


def create_session(
    user: User, 
    terminal_id: Optional[str] = None,
    terminal_name: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> AuthSession:
    """Create new authentication session"""
    db = SessionLocal()
    try:
        # Generate tokens
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "permissions": get_user_permissions(user.role),
            "terminal": terminal_id
        }
        
        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data={"sub": str(user.id), "terminal": terminal_id})
        
        # Create session record
        session = AuthSession(
            user_id=user.id,
            terminal_id=terminal_id,
            terminal_name=terminal_name,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
            refresh_expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        db.add(session)
        db.commit()
        db.refresh(session)
        
        # Log security event
        log_security_event(
            event_type="session_created",
            user_id=user.id,
            session_id=session.id,
            ip_address=ip_address,
            user_agent=user_agent,
            terminal_id=terminal_id,
            description=f"Session created for user {user.username}",
            severity="info"
        )
        
        return session
        
    finally:
        db.close()


def refresh_session_token(refresh_token: str) -> Optional[Dict[str, Any]]:
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("type") != "refresh":
            return None
            
        user_id = payload.get("sub")
        terminal_id = payload.get("terminal")
        
        if not user_id:
            return None
            
        db = SessionLocal()
        try:
            # Find active session with this refresh token
            session = db.query(AuthSession).filter(
                and_(
                    AuthSession.refresh_token == refresh_token,
                    AuthSession.is_active == True,
                    AuthSession.user_id == int(user_id)
                )
            ).first()
            
            if not session or session.is_refresh_expired():
                return None
                
            # Get user
            user = db.query(User).filter(
                and_(
                    User.id == int(user_id),
                    User.is_active == True
                )
            ).first()
            
            if not user:
                return None
                
            # Generate new access token
            token_data = {
                "sub": str(user.id),
                "username": user.username,
                "name": user.name,
                "role": user.role,
                "permissions": get_user_permissions(user.role),
                "terminal": terminal_id
            }
            
            new_access_token = create_access_token(data=token_data)
            
            # Update session
            session.access_token = new_access_token
            session.expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            session.update_activity()
            
            db.commit()
            
            # Log security event
            log_security_event(
                event_type="token_refreshed",
                user_id=user.id,
                session_id=session.id,
                terminal_id=terminal_id,
                description=f"Access token refreshed for user {user.username}",
                severity="info"
            )
            
            return {
                "access_token": new_access_token,
                "token_type": "bearer",
                "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "name": user.name,
                    "role": user.role,
                    "permissions": get_user_permissions(user.role),
                    "preferred_language": user.preferred_language
                }
            }
            
        finally:
            db.close()
            
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None


def invalidate_session(access_token: str, reason: str = "logout"):
    """Invalidate authentication session"""
    db = SessionLocal()
    try:
        session = db.query(AuthSession).filter(
            and_(
                AuthSession.access_token == access_token,
                AuthSession.is_active == True
            )
        ).first()
        
        if session:
            session.revoke(reason)
            db.commit()
            
            # Log security event
            log_security_event(
                event_type="session_invalidated",
                user_id=session.user_id,
                session_id=session.id,
                terminal_id=session.terminal_id,
                description=f"Session invalidated: {reason}",
                severity="info"
            )
            
    finally:
        db.close()


def cleanup_expired_sessions():
    """Clean up expired sessions (should be run periodically)"""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        
        # Find expired sessions
        expired_sessions = db.query(AuthSession).filter(
            and_(
                AuthSession.is_active == True,
                AuthSession.expires_at < now
            )
        ).all()
        
        for session in expired_sessions:
            session.revoke("expired")
            
        db.commit()
        
        return len(expired_sessions)
        
    finally:
        db.close()


def get_user_active_sessions(user_id: int) -> list:
    """Get all active sessions for a user"""
    db = SessionLocal()
    try:
        sessions = db.query(AuthSession).filter(
            and_(
                AuthSession.user_id == user_id,
                AuthSession.is_active == True
            )
        ).order_by(desc(AuthSession.last_activity)).all()
        
        return sessions
        
    finally:
        db.close()