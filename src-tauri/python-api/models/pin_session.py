"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                    PIN Session Model                                            │
│                                                                                                  │
│  Description: Simple PIN-based session management for fast POS operations.                       │
│               Stores hashed PINs locally with minimal validation overhead.                       │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, DateTime, Boolean, Integer
from sqlalchemy.orm import relationship
from database.base import BaseModel
import hashlib
from datetime import datetime


class PinSession(BaseModel):
    """PIN-based session for fast POS authentication"""
    
    __tablename__ = "pin_sessions"
    
    # User identification
    user_id = Column(Integer, nullable=False, index=True)
    username = Column(String(50), nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    
    # PIN authentication (4-6 digits, hashed)
    pin_hash = Column(String(64), nullable=False)  # SHA-256 hash
    
    # Role and permissions
    role = Column(String(20), nullable=False, default="cashier")
    
    # Session management
    last_used = Column(DateTime(timezone=True), nullable=True)
    session_start = Column(DateTime(timezone=True), nullable=True)
    
    # User preferences
    preferred_language = Column(String(5), default="en")
    
    # Account linking (optional for cloud features)
    has_account = Column(Boolean, default=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    
    def __repr__(self):
        return f"<PinSession(username='{self.username}', role='{self.role}')>"
    
    @staticmethod
    def hash_pin(pin: str) -> str:
        """Hash PIN using SHA-256 (simple and fast)"""
        return hashlib.sha256(pin.encode()).hexdigest()
    
    def verify_pin(self, pin: str) -> bool:
        """Verify PIN against stored hash"""
        return self.pin_hash == self.hash_pin(pin)
    
    def update_last_used(self):
        """Update last used timestamp"""
        self.last_used = datetime.utcnow()
    
    def get_permissions(self) -> list:
        """Get permissions based on role"""
        permissions = {
            "owner": [
                "dashboard", "sales", "inventory", "customers", "suppliers", 
                "reports", "settings", "users", "backup", "system"
            ],
            "cashier": [
                "dashboard", "sales", "inventory", "customers", "reports"
            ],
            "helper": [
                "dashboard", "sales"
            ]
        }
        return permissions.get(self.role, [])
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission"""
        return permission in self.get_permissions()
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": self.username,
            "display_name": self.display_name,
            "role": self.role,
            "permissions": self.get_permissions(),
            "preferred_language": self.preferred_language,
            "has_account": self.has_account,
            "last_used": self.last_used.isoformat() if self.last_used else None
        }