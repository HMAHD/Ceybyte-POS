"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                               Authentication Session Model                                       │
│                                                                                                  │
│  Description: Session management for user authentication with terminal-specific tracking.        │
│               Supports token refresh, session invalidation, and multi-terminal sessions.         │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from database.base import BaseModel
from datetime import datetime, timezone


class AuthSession(BaseModel):
    """User authentication session model for terminal-specific session management"""
    
    __tablename__ = "auth_sessions"
    
    # User reference
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Terminal information
    terminal_id = Column(String(50), nullable=True)  # Terminal identifier
    terminal_name = Column(String(100), nullable=True)  # Human-readable terminal name
    
    # Session data
    access_token = Column(String(500), nullable=False, unique=True, index=True)
    refresh_token = Column(String(500), nullable=False, unique=True, index=True)
    token_type = Column(String(20), default="bearer")
    
    # Session timing
    login_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    logout_time = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    refresh_expires_at = Column(DateTime(timezone=True), nullable=False)
    last_activity = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Session management
    is_active = Column(Boolean, default=True)
    logout_reason = Column(String(100), nullable=True)  # logout, timeout, security, admin, forced
    
    # Authentication method tracking
    login_method = Column(String(50), default="password")  # password, pin
    
    # Security tracking
    ip_address = Column(String(45), nullable=True)  # IPv6 support
    user_agent = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)  # Location description
    
    # Relationships
    user = relationship("User", back_populates="auth_sessions")
    
    def __repr__(self):
        return f"<AuthSession(user_id={self.user_id}, terminal='{self.terminal_id}', active={self.is_active})>"
    
    def is_expired(self) -> bool:
        """Check if session is expired"""
        now = datetime.now(timezone.utc)
        return now > self.expires_at
    
    def is_refresh_expired(self) -> bool:
        """Check if refresh token is expired"""
        now = datetime.now(timezone.utc)
        return now > self.refresh_expires_at
    
    def revoke(self, reason: str = "logout"):
        """Revoke the session"""
        self.is_active = False
        self.logout_time = datetime.now(timezone.utc)
        self.logout_reason = reason
    
    def update_activity(self):
        """Update last activity timestamp"""
        self.last_activity = datetime.now(timezone.utc)


class LoginAttempt(BaseModel):
    """Login attempt tracking for brute force protection"""
    
    __tablename__ = "login_attempts"
    
    # Attempt details
    username = Column(String(50), nullable=False, index=True)
    ip_address = Column(String(45), nullable=False, index=True)
    user_agent = Column(Text, nullable=True)
    
    # Attempt result
    success = Column(Boolean, default=False)
    failure_reason = Column(String(100), nullable=True)  # invalid_password, user_not_found, account_locked
    
    # Timing
    attempted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Terminal information
    terminal_id = Column(String(50), nullable=True)
    
    def __repr__(self):
        return f"<LoginAttempt(username='{self.username}', success={self.success}, ip='{self.ip_address}')>"


class SecurityEvent(BaseModel):
    """Security events logging for audit and monitoring"""
    
    __tablename__ = "security_events"
    
    # Event details
    event_type = Column(String(50), nullable=False)  # login, logout, token_refresh, password_change, etc.
    event_description = Column(Text, nullable=True)
    severity = Column(String(20), default="info")  # info, warning, critical
    
    # User and session context
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(Integer, ForeignKey("auth_sessions.id"), nullable=True)
    
    # Request context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    terminal_id = Column(String(50), nullable=True)
    
    # Additional data
    event_metadata = Column(Text, nullable=True)  # JSON string for additional context
    
    # Timing
    occurred_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User")
    session = relationship("AuthSession")
    
    def __repr__(self):
        return f"<SecurityEvent(type='{self.event_type}', severity='{self.severity}', user_id={self.user_id})>"