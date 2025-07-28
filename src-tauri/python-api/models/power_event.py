"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                    Power Event Model                                             ║
║                                                                                                  ║
║  Description: SQLAlchemy model for tracking power events, UPS status, and battery monitoring.    ║
║               Stores comprehensive power event logging for business analysis.                     ║
║                                                                                                  ║
║  Author: Akash Hasendra                                                                          ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, JSON
from sqlalchemy.sql import func
from database.base import Base


class PowerEvent(Base):
    """Power event logging model for UPS monitoring and power cut management"""
    
    __tablename__ = "power_events"
    
    id = Column(Integer, primary_key=True, index=True)
    terminal_id = Column(String(50), nullable=False, index=True)
    event_type = Column(String(20), nullable=False, index=True)  # power_cut, power_restored, battery_low, battery_critical, ups_detected, ups_disconnected
    event_timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # UPS Status Information
    ups_status = Column(String(20))  # online, on_battery, low_battery, critical, not_detected
    battery_level = Column(Float)  # 0-100 percentage
    estimated_runtime = Column(Integer)  # minutes
    voltage = Column(Float)  # voltage reading
    ups_model = Column(String(100))  # UPS model information
    
    # Event Details
    duration_seconds = Column(Integer)  # duration of power cut/battery usage
    affected_transactions = Column(Integer, default=0)  # number of transactions affected
    recovery_status = Column(String(20))  # successful, partial, failed
    
    # Additional Data
    event_metadata = Column(JSON)  # additional event-specific data
    notes = Column(Text)  # human-readable notes
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<PowerEvent(id={self.id}, type={self.event_type}, terminal={self.terminal_id}, timestamp={self.event_timestamp})>"
    
    def to_dict(self):
        """Convert model to dictionary for API responses"""
        return {
            "id": self.id,
            "terminal_id": self.terminal_id,
            "event_type": self.event_type,
            "event_timestamp": self.event_timestamp.isoformat() if self.event_timestamp else None,
            "ups_status": self.ups_status,
            "battery_level": self.battery_level,
            "estimated_runtime": self.estimated_runtime,
            "voltage": self.voltage,
            "ups_model": self.ups_model,
            "duration_seconds": self.duration_seconds,
            "affected_transactions": self.affected_transactions,
            "recovery_status": self.recovery_status,
            "event_metadata": self.event_metadata,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class TransactionState(Base):
    """Model for storing transaction state during power cuts for recovery"""
    
    __tablename__ = "transaction_states"
    
    id = Column(Integer, primary_key=True, index=True)
    terminal_id = Column(String(50), nullable=False, index=True)
    session_id = Column(String(100), nullable=False, index=True)  # unique session identifier
    
    # Transaction Data
    transaction_data = Column(JSON, nullable=False)  # complete transaction state
    transaction_type = Column(String(20), nullable=False)  # sale, return, hold
    customer_id = Column(Integer)  # if applicable
    user_id = Column(Integer, nullable=False)
    
    # State Information
    state_type = Column(String(20), nullable=False, default='active')  # active, held, completed, recovered
    last_action = Column(String(50))  # last action performed
    auto_save_count = Column(Integer, default=0)  # number of auto-saves
    
    # Recovery Information
    recovery_attempted = Column(Boolean, default=False)
    recovery_successful = Column(Boolean, default=False)
    recovery_timestamp = Column(DateTime(timezone=True))
    recovery_notes = Column(Text)
    
    # Print Queue
    pending_receipts = Column(JSON)  # receipts waiting to be printed
    print_attempts = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime(timezone=True))  # when to clean up old states
    
    def __repr__(self):
        return f"<TransactionState(id={self.id}, session={self.session_id}, type={self.transaction_type}, state={self.state_type})>"
    
    def to_dict(self):
        """Convert model to dictionary for API responses"""
        return {
            "id": self.id,
            "terminal_id": self.terminal_id,
            "session_id": self.session_id,
            "transaction_data": self.transaction_data,
            "transaction_type": self.transaction_type,
            "customer_id": self.customer_id,
            "user_id": self.user_id,
            "state_type": self.state_type,
            "last_action": self.last_action,
            "auto_save_count": self.auto_save_count,
            "recovery_attempted": self.recovery_attempted,
            "recovery_successful": self.recovery_successful,
            "recovery_timestamp": self.recovery_timestamp.isoformat() if self.recovery_timestamp else None,
            "recovery_notes": self.recovery_notes,
            "pending_receipts": self.pending_receipts,
            "print_attempts": self.print_attempts,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
        }