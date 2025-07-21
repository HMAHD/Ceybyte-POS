"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                    Audit Log Model                                               │
│                                                                                                  │
│  Description: Audit log model for tracking user actions and system events.                       │
│               Provides comprehensive logging for security and compliance.                        │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import BaseModel


class AuditLog(BaseModel):
    """Audit log model for tracking user actions and system events"""
    
    __tablename__ = "audit_logs"
    
    # Log identification
    log_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # User and session information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), nullable=True)
    terminal_id = Column(String(50), nullable=True)
    
    # Action information
    action = Column(String(100), nullable=False, index=True)  # login, sale_create, product_update, etc.
    category = Column(String(50), nullable=False, index=True)  # auth, sales, inventory, system, etc.
    severity = Column(String(20), default="info")  # info, warning, error, critical
    
    # Target information
    target_type = Column(String(50), nullable=True)  # product, sale, customer, user, etc.
    target_id = Column(String(50), nullable=True)
    target_name = Column(String(200), nullable=True)
    
    # Event details
    description = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)  # Additional structured data
    
    # Request information
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    request_method = Column(String(10), nullable=True)  # GET, POST, PUT, DELETE
    request_url = Column(String(500), nullable=True)
    
    # Timing information
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    duration_ms = Column(Integer, nullable=True)  # Action duration in milliseconds
    
    # Status information
    status = Column(String(20), default="success")  # success, failure, warning
    error_message = Column(Text, nullable=True)
    
    # Data changes (for update/delete operations)
    old_values = Column(JSON, nullable=True)  # Previous values
    new_values = Column(JSON, nullable=True)  # New values
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog(action='{self.action}', user_id={self.user_id}, timestamp='{self.timestamp}')>"
    
    @classmethod
    def log_action(cls, session, action: str, category: str, description: str, 
                   user_id: int = None, target_type: str = None, target_id: str = None,
                   target_name: str = None, details: dict = None, severity: str = "info",
                   status: str = "success", error_message: str = None,
                   old_values: dict = None, new_values: dict = None,
                   ip_address: str = None, user_agent: str = None,
                   terminal_id: str = None, session_id: str = None):
        """Create a new audit log entry"""
        import uuid
        
        log_entry = cls(
            log_id=str(uuid.uuid4()),
            user_id=user_id,
            session_id=session_id,
            terminal_id=terminal_id,
            action=action,
            category=category,
            severity=severity,
            target_type=target_type,
            target_id=str(target_id) if target_id else None,
            target_name=target_name,
            description=description,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
            error_message=error_message,
            old_values=old_values,
            new_values=new_values
        )
        
        session.add(log_entry)
        return log_entry
    
    @classmethod
    def log_login(cls, session, user_id: int, username: str, success: bool = True,
                  ip_address: str = None, user_agent: str = None, terminal_id: str = None,
                  error_message: str = None):
        """Log user login attempt"""
        return cls.log_action(
            session=session,
            action="user_login",
            category="auth",
            description=f"User '{username}' login {'successful' if success else 'failed'}",
            user_id=user_id if success else None,
            severity="info" if success else "warning",
            status="success" if success else "failure",
            error_message=error_message,
            ip_address=ip_address,
            user_agent=user_agent,
            terminal_id=terminal_id
        )
    
    @classmethod
    def log_sale(cls, session, user_id: int, sale_id: int, sale_number: str,
                 total_amount: float, customer_name: str = None, terminal_id: str = None):
        """Log sale transaction"""
        description = f"Sale {sale_number} completed for {total_amount:.2f}"
        if customer_name:
            description += f" (Customer: {customer_name})"
            
        return cls.log_action(
            session=session,
            action="sale_create",
            category="sales",
            description=description,
            user_id=user_id,
            target_type="sale",
            target_id=str(sale_id),
            target_name=sale_number,
            details={"total_amount": total_amount, "customer_name": customer_name},
            terminal_id=terminal_id
        )
    
    @classmethod
    def log_product_update(cls, session, user_id: int, product_id: int, product_name: str,
                          old_values: dict, new_values: dict, terminal_id: str = None):
        """Log product update"""
        return cls.log_action(
            session=session,
            action="product_update",
            category="inventory",
            description=f"Product '{product_name}' updated",
            user_id=user_id,
            target_type="product",
            target_id=str(product_id),
            target_name=product_name,
            old_values=old_values,
            new_values=new_values,
            terminal_id=terminal_id
        )
    
    def get_severity_color(self) -> str:
        """Get color code for severity level"""
        colors = {
            "info": "#2563eb",      # Blue
            "warning": "#d97706",   # Orange
            "error": "#dc2626",     # Red
            "critical": "#7c2d12"   # Dark red
        }
        return colors.get(self.severity, "#6b7280")  # Gray default