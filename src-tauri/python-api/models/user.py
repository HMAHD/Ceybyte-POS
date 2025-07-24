"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                      User Model                                                  │
│                                                                                                  │
│  Description: User model with roles (Owner, Cashier, Helper) and authentication.                 │
│               Supports PIN-based quick login for helpers and session management.                 │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from database.base import BaseModel


class User(BaseModel):
    """User model for authentication and role management"""
    
    __tablename__ = "users"
    
    # Basic user information
    username = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Authentication
    password_hash = Column(String(255), nullable=False)
    pin = Column(String(10), nullable=True)  # For quick helper login
    
    # Role-based access control
    role = Column(String(20), nullable=False, default="cashier")  # owner, cashier, helper
    
    # Session management
    last_login = Column(DateTime(timezone=True), nullable=True)
    last_activity = Column(DateTime(timezone=True), nullable=True)
    session_token = Column(String(255), nullable=True)
    
    # User preferences
    preferred_language = Column(String(5), default="en")  # en, si, ta
    
    # Additional information
    notes = Column(Text, nullable=True)
    
    # Relationships
    sales = relationship("Sale", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    auth_sessions = relationship("AuthSession", back_populates="user")
    
    def __repr__(self):
        return f"<User(username='{self.username}', name='{self.name}', role='{self.role}')>"
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission based on role"""
        permissions = {
            "owner": [
                "sales", "inventory", "customers", "suppliers", "reports", 
                "settings", "users", "backup", "system"
            ],
            "cashier": [
                "sales", "inventory", "customers", "basic_reports"
            ],
            "helper": [
                "sales"
            ]
        }
        
        return permission in permissions.get(self.role, [])
    
    def get_permissions(self) -> list:
        """Get all permissions for user role"""
        permissions = {
            "owner": [
                "sales", "inventory", "customers", "suppliers", "reports", 
                "settings", "users", "backup", "system"
            ],
            "cashier": [
                "sales", "inventory", "customers", "basic_reports"
            ],
            "helper": [
                "sales"
            ]
        }
        
        return permissions.get(self.role, [])