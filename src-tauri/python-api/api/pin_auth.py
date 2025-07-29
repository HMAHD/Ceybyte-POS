"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   PIN Authentication API                                         │
│                                                                                                  │
│  Description: Fast PIN-based authentication endpoints for POS operations.                        │
│               No JWT tokens, minimal overhead, instant responses.                                │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.pin_auth import PinAuthService

router = APIRouter(prefix="/pin-auth", tags=["PIN Authentication"])


class PinLoginRequest(BaseModel):
    username: str
    pin: str


class CreatePinUserRequest(BaseModel):
    username: str
    display_name: str
    pin: str
    role: str = "cashier"
    preferred_language: str = "en"


class UpdatePinRequest(BaseModel):
    username: str
    old_pin: str
    new_pin: str


class LinkAccountRequest(BaseModel):
    username: str
    email: str
    phone: str = None


@router.post("/login")
async def pin_login(request: PinLoginRequest):
    """Fast PIN-based login"""
    try:
        result = PinAuthService.authenticate_pin(request.username, request.pin)
        
        if not result:
            raise HTTPException(status_code=401, detail="Invalid username or PIN")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.get("/users")
async def get_pin_users():
    """Get all PIN users for selection"""
    try:
        users = PinAuthService.get_all_pin_users()
        return {"success": True, "users": users}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")


@router.post("/create-user")
async def create_pin_user(request: CreatePinUserRequest):
    """Create new PIN user"""
    try:
        # Validate PIN (4-6 digits)
        if not request.pin.isdigit() or len(request.pin) < 4 or len(request.pin) > 6:
            raise HTTPException(status_code=400, detail="PIN must be 4-6 digits")
        
        # Validate role
        if request.role not in ["owner", "cashier", "helper"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        
        pin_session = PinAuthService.create_pin_user(
            username=request.username,
            display_name=request.display_name,
            pin=request.pin,
            role=request.role,
            preferred_language=request.preferred_language
        )
        
        if not pin_session:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        return {
            "success": True,
            "message": "PIN user created successfully",
            "user": pin_session.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@router.post("/update-pin")
async def update_pin(request: UpdatePinRequest):
    """Update user PIN"""
    try:
        # Validate new PIN
        if not request.new_pin.isdigit() or len(request.new_pin) < 4 or len(request.new_pin) > 6:
            raise HTTPException(status_code=400, detail="PIN must be 4-6 digits")
        
        success = PinAuthService.update_pin(
            username=request.username,
            old_pin=request.old_pin,
            new_pin=request.new_pin
        )
        
        if not success:
            raise HTTPException(status_code=401, detail="Invalid username or current PIN")
        
        return {"success": True, "message": "PIN updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update PIN: {str(e)}")


@router.post("/link-account")
async def link_account(request: LinkAccountRequest):
    """Link PIN user to account for cloud features"""
    try:
        success = PinAuthService.link_account(
            username=request.username,
            email=request.email,
            phone=request.phone
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True, "message": "Account linked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to link account: {str(e)}")


@router.post("/setup-defaults")
async def setup_default_users():
    """Setup default PIN users for first run"""
    try:
        PinAuthService.setup_default_users()
        return {"success": True, "message": "Default users setup completed"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Setup failed: {str(e)}")