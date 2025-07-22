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

from fastapi import APIRouter, HTTPException, status, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from utils.auth import (
    authenticate_user, authenticate_user_pin, create_user_token,
    get_current_user_from_token, USER_ROLES
)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()


# Request/Response Models
class LoginRequest(BaseModel):
    username: str
    password: str


class PinLoginRequest(BaseModel):
    username: str
    pin: str


class AuthResponse(BaseModel):
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


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Authenticate user with username and password"""
    user = authenticate_user(request.username, request.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    token_data = create_user_token(user)
    return token_data


@router.post("/pin-login", response_model=AuthResponse)
async def pin_login(request: PinLoginRequest):
    """Authenticate user with username and PIN for quick switching"""
    user = authenticate_user_pin(request.username, request.pin)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or PIN"
        )
    
    token_data = create_user_token(user)
    return token_data


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


@router.post("/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user (invalidate token on client side)"""
    # In a more complex system, we might maintain a token blacklist
    # For now, client-side token removal is sufficient
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