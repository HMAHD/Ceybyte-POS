"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  PIN Authentication Service                                      │
│                                                                                                  │
│  Description: Fast PIN-based authentication service for POS operations.                          │
│               Minimal overhead, local storage, instant validation.                               │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from models.pin_session import PinSession
from database.connection import SessionLocal


class PinAuthService:
    """Service for PIN-based authentication"""
    
    @staticmethod
    def create_pin_user(
        username: str,
        display_name: str,
        pin: str,
        role: str = "cashier",
        preferred_language: str = "en"
    ) -> Optional[PinSession]:
        """Create a new PIN user"""
        db = SessionLocal()
        try:
            # Check if username already exists
            existing = db.query(PinSession).filter(
                PinSession.username == username
            ).first()
            
            if existing:
                return None
            
            # Create new PIN session
            pin_session = PinSession(
                user_id=hash(username) % 1000000,  # Simple user ID generation
                username=username,
                display_name=display_name,
                pin_hash=PinSession.hash_pin(pin),
                role=role,
                preferred_language=preferred_language,
                session_start=datetime.utcnow(),
                last_used=datetime.utcnow()
            )
            
            db.add(pin_session)
            db.commit()
            db.refresh(pin_session)
            
            return pin_session
            
        except Exception as e:
            db.rollback()
            print(f"Error creating PIN user: {e}")
            return None
        finally:
            db.close()
    
    @staticmethod
    def authenticate_pin(username: str, pin: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with PIN - fast and simple"""
        db = SessionLocal()
        try:
            pin_session = db.query(PinSession).filter(
                PinSession.username == username,
                PinSession.is_active == True
            ).first()
            
            if not pin_session:
                return None
            
            if not pin_session.verify_pin(pin):
                return None
            
            # Update last used
            pin_session.update_last_used()
            db.commit()
            
            # Return user data (no token needed)
            return {
                "success": True,
                "user": pin_session.to_dict(),
                "session_type": "pin"
            }
            
        except Exception as e:
            print(f"PIN authentication error: {e}")
            return None
        finally:
            db.close()
    
    @staticmethod
    def get_all_pin_users() -> list:
        """Get all PIN users for selection"""
        db = SessionLocal()
        try:
            sessions = db.query(PinSession).filter(
                PinSession.is_active == True
            ).order_by(PinSession.display_name).all()
            
            return [
                {
                    "username": session.username,
                    "display_name": session.display_name,
                    "role": session.role,
                    "last_used": session.last_used.isoformat() if session.last_used else None
                }
                for session in sessions
            ]
            
        except Exception as e:
            print(f"Error getting PIN users: {e}")
            return []
        finally:
            db.close()
    
    @staticmethod
    def update_pin(username: str, old_pin: str, new_pin: str) -> bool:
        """Update user PIN"""
        db = SessionLocal()
        try:
            pin_session = db.query(PinSession).filter(
                PinSession.username == username,
                PinSession.is_active == True
            ).first()
            
            if not pin_session or not pin_session.verify_pin(old_pin):
                return False
            
            pin_session.pin_hash = PinSession.hash_pin(new_pin)
            db.commit()
            
            return True
            
        except Exception as e:
            print(f"Error updating PIN: {e}")
            return False
        finally:
            db.close()
    
    @staticmethod
    def link_account(
        username: str,
        email: str,
        phone: str = None
    ) -> bool:
        """Link PIN user to account for cloud features"""
        db = SessionLocal()
        try:
            pin_session = db.query(PinSession).filter(
                PinSession.username == username,
                PinSession.is_active == True
            ).first()
            
            if not pin_session:
                return False
            
            pin_session.has_account = True
            pin_session.email = email
            pin_session.phone = phone
            db.commit()
            
            return True
            
        except Exception as e:
            print(f"Error linking account: {e}")
            return False
        finally:
            db.close()
    
    @staticmethod
    def setup_default_users():
        """Setup default PIN users for first run"""
        default_users = [
            {
                "username": "owner",
                "display_name": "Owner",
                "pin": "1234",
                "role": "owner"
            },
            {
                "username": "cashier",
                "display_name": "Cashier",
                "pin": "5678",
                "role": "cashier"
            }
        ]
        
        for user_data in default_users:
            existing = PinAuthService.authenticate_pin(user_data["username"], "0000")
            if not existing:
                PinAuthService.create_pin_user(**user_data)