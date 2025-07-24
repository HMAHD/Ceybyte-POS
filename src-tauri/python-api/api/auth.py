"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   Authentication API Routes                                      │
│                                                                                                  │
│  Description: FastAPI routes for user authentication, login, logout, and token management.       │
│               Supports both username/password and PIN-based authentication.                      │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException, status, Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from utils.auth import (
    authenticate_user, authenticate_user_pin, create_user_token,
    get_current_user_from_token, USER_ROLES, check_brute_force_protection,
    log_login_attempt, create_session, refresh_session_token, invalidate_session,
    log_security_event, get_user_active_sessions, cleanup_expired_sessions
)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


# Request/Response Models
class LoginRequest(BaseModel):
    username: str
    password: str
    terminal_id: Optional[str] = None
    terminal_name: Optional[str] = None


class PinLoginRequest(BaseModel):
    username: str
    pin: str
    terminal_id: Optional[str] = None
    terminal_name: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict


class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: dict


class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    role: str
    permissions: list
    preferred_language: str


class SessionResponse(BaseModel):
    id: int
    terminal_id: Optional[str]
    terminal_name: Optional[str]
    created_at: str
    last_activity: str
    ip_address: Optional[str]


def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    if hasattr(request, 'client') and request.client:
        return request.client.host
    return "127.0.0.1"


def get_user_agent(request: Request) -> Optional[str]:
    """Get user agent from request headers"""
    return request.headers.get("user-agent")


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, http_request: Request):
    """Authenticate user with username and password with brute force protection"""
    ip_address = get_client_ip(http_request)
    user_agent = get_user_agent(http_request)
    
    # Check brute force protection
    if check_brute_force_protection(request.username, ip_address):
        log_login_attempt(
            username=request.username,
            success=False,
            ip_address=ip_address,
            user_agent=user_agent,
            terminal_id=request.terminal_id,
            failure_reason="brute_force_protection"
        )
        
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please try again later."
        )
    
    # Authenticate user
    user = authenticate_user(request.username, request.password)
    
    if not user:
        log_login_attempt(
            username=request.username,
            success=False,
            ip_address=ip_address,
            user_agent=user_agent,
            terminal_id=request.terminal_id,
            failure_reason="invalid_credentials"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Log successful login
    log_login_attempt(
        username=request.username,
        success=True,
        ip_address=ip_address,
        user_agent=user_agent,
        terminal_id=request.terminal_id
    )
    
    # Create session
    session = create_session(
        user=user,
        terminal_id=request.terminal_id,
        terminal_name=request.terminal_name,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        token_type="bearer",
        expires_in=480 * 60,  # 8 hours in seconds
        user={
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "permissions": user.get_permissions(),
            "preferred_language": user.preferred_language
        }
    )


@router.post("/pin-login", response_model=AuthResponse)
async def pin_login(request: PinLoginRequest, http_request: Request):
    """Authenticate user with username and PIN for quick switching"""
    ip_address = get_client_ip(http_request)
    user_agent = get_user_agent(http_request)
    
    # PIN login has less strict brute force protection
    user = authenticate_user_pin(request.username, request.pin)
    
    if not user:
        log_login_attempt(
            username=request.username,
            success=False,
            ip_address=ip_address,
            user_agent=user_agent,
            terminal_id=request.terminal_id,
            failure_reason="invalid_pin"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or PIN"
        )
    
    # Log successful PIN login
    log_login_attempt(
        username=request.username,
        success=True,
        ip_address=ip_address,
        user_agent=user_agent,
        terminal_id=request.terminal_id
    )
    
    # Create session
    session = create_session(
        user=user,
        terminal_id=request.terminal_id,
        terminal_name=request.terminal_name,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        token_type="bearer",
        expires_in=480 * 60,  # 8 hours in seconds
        user={
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "role": user.role,
            "permissions": user.get_permissions(),
            "preferred_language": user.preferred_language
        }
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user information"""
    user = get_current_user_from_token(credentials.credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return UserResponse(
        id=user.id,
        username=user.username,
        name=user.name,
        role=user.role,
        permissions=user.get_permissions(),
        preferred_language=user.preferred_language
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(request: RefreshRequest):
    """Refresh access token using refresh token"""
    token_data = refresh_session_token(request.refresh_token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    return TokenRefreshResponse(**token_data)


@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user and invalidate session"""
    invalidate_session(credentials.credentials, "logout")
    return {"message": "Successfully logged out"}


@router.get("/roles")
async def get_user_roles():
    """Get available user roles and their permissions"""
    return USER_ROLES


@router.get("/verify-token")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify if token is valid"""
    user = get_current_user_from_token(credentials.credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return {"valid": True, "user_id": user.id, "username": user.username}


@router.get("/sessions", response_model=list[SessionResponse])
async def get_my_sessions(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all active sessions for current user"""
    user = get_current_user_from_token(credentials.credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    sessions = get_user_active_sessions(user.id)
    
    return [
        SessionResponse(
            id=session.id,
            terminal_id=session.terminal_id,
            terminal_name=session.terminal_name,
            created_at=session.created_at.isoformat() if session.created_at else "",
            last_activity=session.last_activity.isoformat() if session.last_activity else "",
            ip_address=session.ip_address
        )
        for session in sessions
    ]


@router.post("/sessions/{session_id}/revoke")
async def revoke_session(
    session_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Revoke a specific session"""
    user = get_current_user_from_token(credentials.credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Find the session and verify ownership
    from database.connection import SessionLocal
    from models.auth_session import AuthSession
    from sqlalchemy import and_
    
    db = SessionLocal()
    try:
        session = db.query(AuthSession).filter(
            and_(
                AuthSession.id == session_id,
                AuthSession.user_id == user.id,
                AuthSession.is_active == True
            )
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        session.revoke("manual_revocation")
        db.commit()
        
        log_security_event(
            event_type="session_revoked",
            user_id=user.id,
            session_id=session.id,
            terminal_id=session.terminal_id,
            description=f"Session manually revoked by user {user.username}",
            severity="info"
        )
        
        return {"message": "Session revoked successfully"}
        
    finally:
        db.close()


@router.post("/cleanup-sessions")
async def cleanup_sessions():
    """Clean up expired sessions (admin endpoint)"""
    # This could be restricted to admin users only
    cleaned_count = cleanup_expired_sessions()
    return {"message": f"Cleaned up {cleaned_count} expired sessions"}