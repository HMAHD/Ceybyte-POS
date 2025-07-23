"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   User Management API Routes                                     │
│                                                                                                  │
│  Description: FastAPI routes for user management, creation, editing, and role management.        │
│               Supports CRUD operations for users with role-based access control.                 │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from sqlalchemy import and_, or_, desc
from sqlalchemy.exc import IntegrityError

from database.connection import SessionLocal
from models.user import User
from utils.auth import (
    get_current_user_from_token, hash_password, validate_password_complexity,
    USER_ROLES, get_user_permissions, log_security_event
)

router = APIRouter(prefix="/users", tags=["user-management"])
security = HTTPBearer()


# Request/Response Models
class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=6)
    pin: Optional[str] = Field(None, min_length=4, max_length=6)
    role: str = Field(..., pattern="^(owner|cashier|helper)$")
    preferred_language: str = Field("en", pattern="^(en|si|ta)$")
    notes: Optional[str] = None
    is_active: bool = True

    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v.lower()

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v

    @field_validator('pin')
    @classmethod
    def validate_pin(cls, v):
        if v and not v.isdigit():
            raise ValueError('PIN must contain only numbers')
        return v


class UpdateUserRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    pin: Optional[str] = Field(None, min_length=4, max_length=6)
    role: Optional[str] = Field(None, pattern="^(owner|cashier|helper)$")
    preferred_language: Optional[str] = Field(None, pattern="^(en|si|ta)$")
    notes: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v

    @field_validator('pin')
    @classmethod
    def validate_pin(cls, v):
        if v and not v.isdigit():
            raise ValueError('PIN must contain only numbers')
        return v


class PasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    email: Optional[str]
    phone: Optional[str]
    role: str
    role_name: str
    permissions: List[str]
    preferred_language: str
    is_active: bool
    last_login: Optional[str]
    last_activity: Optional[str]
    created_at: str
    updated_at: Optional[str]
    notes: Optional[str]
    has_pin: bool


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    per_page: int


def require_admin_access(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to require admin access (owner role)"""
    user = get_current_user_from_token(credentials.credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    if user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user


def user_to_response(user: User) -> UserResponse:
    """Convert User model to UserResponse"""
    return UserResponse(
        id=user.id,
        username=user.username,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        role_name=USER_ROLES.get(user.role, {}).get("name", user.role.title()),
        permissions=get_user_permissions(user.role),
        preferred_language=user.preferred_language,
        is_active=user.is_active,
        last_login=user.last_login.isoformat() if user.last_login else None,
        last_activity=user.last_activity.isoformat() if user.last_activity else None,
        created_at=user.created_at.isoformat() if user.created_at else "",
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
        notes=user.notes,
        has_pin=bool(user.pin)
    )


@router.get("/", response_model=UserListResponse)
async def get_users(
    search: Optional[str] = Query(None, description="Search by name or username"),
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(require_admin_access)
):
    """Get list of users with filtering and pagination"""
    db = SessionLocal()
    try:
        query = db.query(User)
        
        # Apply filters
        if search:
            search_filter = or_(
                User.name.ilike(f"%{search}%"),
                User.username.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if role:
            query = query.filter(User.role == role)
        
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        users = query.order_by(desc(User.created_at)).offset(offset).limit(per_page).all()
        
        return UserListResponse(
            users=[user_to_response(user) for user in users],
            total=total,
            page=page,
            per_page=per_page
        )
        
    finally:
        db.close()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_admin_access)
):
    """Get specific user by ID"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user_to_response(user)
        
    finally:
        db.close()


@router.post("/", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    current_user: User = Depends(require_admin_access)
):
    """Create new user"""
    db = SessionLocal()
    try:
        # Validate password complexity
        is_valid, message = validate_password_complexity(request.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # Check for existing username
        existing_user = db.query(User).filter(User.username == request.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Check for existing email
        if request.email:
            existing_email = db.query(User).filter(User.email == request.email).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        
        # Hash password
        password_hash = hash_password(request.password)
        
        # Create user
        new_user = User(
            username=request.username,
            name=request.name,
            email=request.email,
            phone=request.phone,
            password_hash=password_hash,
            pin=request.pin,
            role=request.role,
            preferred_language=request.preferred_language,
            notes=request.notes,
            is_active=request.is_active
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Log security event
        log_security_event(
            event_type="user_created",
            user_id=current_user.id,
            description=f"User {request.username} created by {current_user.username}",
            severity="info",
            metadata={
                "created_user_id": new_user.id,
                "created_username": request.username,
                "role": request.role
            }
        )
        
        return user_to_response(new_user)
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username or email already exists"
        )
    finally:
        db.close()


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    request: UpdateUserRequest,
    current_user: User = Depends(require_admin_access)
):
    """Update existing user"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent owner from disabling themselves
        if user.id == current_user.id and request.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot disable your own account"
            )
        
        # Check for existing email if updating
        if request.email and request.email != user.email:
            existing_email = db.query(User).filter(
                and_(User.email == request.email, User.id != user_id)
            ).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        
        # Update fields
        update_fields = []
        if request.name is not None:
            user.name = request.name
            update_fields.append("name")
        
        if request.email is not None:
            user.email = request.email
            update_fields.append("email")
        
        if request.phone is not None:
            user.phone = request.phone
            update_fields.append("phone")
        
        if request.pin is not None:
            user.pin = request.pin
            update_fields.append("pin")
        
        if request.role is not None:
            user.role = request.role
            update_fields.append("role")
        
        if request.preferred_language is not None:
            user.preferred_language = request.preferred_language
            update_fields.append("preferred_language")
        
        if request.notes is not None:
            user.notes = request.notes
            update_fields.append("notes")
        
        if request.is_active is not None:
            user.is_active = request.is_active
            update_fields.append("is_active")
        
        db.commit()
        db.refresh(user)
        
        # Log security event
        log_security_event(
            event_type="user_updated",
            user_id=current_user.id,
            description=f"User {user.username} updated by {current_user.username}",
            severity="info",
            metadata={
                "updated_user_id": user.id,
                "updated_username": user.username,
                "updated_fields": update_fields
            }
        )
        
        return user_to_response(user)
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    finally:
        db.close()


@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    request: PasswordResetRequest,
    current_user: User = Depends(require_admin_access)
):
    """Reset user password"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Validate password complexity
        is_valid, message = validate_password_complexity(request.new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # Hash new password
        user.password_hash = hash_password(request.new_password)
        
        db.commit()
        
        # Log security event
        log_security_event(
            event_type="password_reset",
            user_id=current_user.id,
            description=f"Password reset for user {user.username} by {current_user.username}",
            severity="warning",
            metadata={
                "target_user_id": user.id,
                "target_username": user.username
            }
        )
        
        return {"message": "Password reset successfully"}
        
    finally:
        db.close()


@router.post("/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    current_user: User = Depends(require_admin_access)
):
    """Toggle user active/inactive status"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent owner from disabling themselves
        if user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change your own account status"
            )
        
        # Toggle status
        user.is_active = not user.is_active
        db.commit()
        
        # Log security event
        log_security_event(
            event_type="user_status_changed",
            user_id=current_user.id,
            description=f"User {user.username} {'activated' if user.is_active else 'deactivated'} by {current_user.username}",
            severity="info",
            metadata={
                "target_user_id": user.id,
                "target_username": user.username,
                "new_status": user.is_active
            }
        )
        
        return {
            "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
            "is_active": user.is_active
        }
        
    finally:
        db.close()


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(require_admin_access)
):
    """Delete user (soft delete by setting inactive)"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent owner from deleting themselves
        if user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        # Soft delete (set inactive)
        user.is_active = False
        db.commit()
        
        # Log security event
        log_security_event(
            event_type="user_deleted",
            user_id=current_user.id,
            description=f"User {user.username} deleted by {current_user.username}",
            severity="warning",
            metadata={
                "deleted_user_id": user.id,
                "deleted_username": user.username
            }
        )
        
        return {"message": "User deleted successfully"}
        
    finally:
        db.close()


@router.get("/roles/available")
async def get_available_roles():
    """Get available user roles and their permissions"""
    return USER_ROLES