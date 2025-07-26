"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                WhatsApp Message Model                                           │
│                                                                                                  │
│  Description: SQLAlchemy model for WhatsApp message tracking and history                        │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database.base import Base


class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id = Column(Integer, primary_key=True, index=True)
    recipient_phone = Column(String(20), nullable=False, index=True)
    recipient_name = Column(String(255))
    message_type = Column(String(50), nullable=False)  # receipt, reminder, greeting, report, backup
    message_content = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending, sent, failed, delivered
    error_message = Column(Text)
    
    # Related entities
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    
    # Metadata
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sale = relationship("Sale", back_populates="whatsapp_messages")
    customer = relationship("Customer", back_populates="whatsapp_messages")


class WhatsAppConfig(Base):
    __tablename__ = "whatsapp_config"

    id = Column(Integer, primary_key=True, index=True)
    api_url = Column(String(500), nullable=False)
    api_token = Column(String(500), nullable=False)
    business_phone = Column(String(20), nullable=False)
    business_name = Column(String(255), nullable=False)
    
    # Feature toggles
    auto_send_receipts = Column(Boolean, default=False)
    daily_reports_enabled = Column(Boolean, default=False)
    customer_reminders_enabled = Column(Boolean, default=False)
    backup_sharing_enabled = Column(Boolean, default=False)
    
    # Report settings
    daily_report_time = Column(String(5), default="18:00")  # HH:MM format
    owner_phone = Column(String(20))
    
    # Message templates
    receipt_template = Column(Text)
    reminder_template = Column(Text)
    greeting_template = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)