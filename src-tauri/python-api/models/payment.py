"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                     Payment Model                                                │
│                                                                                                  │
│  Description: Payment transactions for sales with multiple payment method support.               │
│               Handles cash, card, mobile money, and mixed payments.                              │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import BaseModel


class Payment(BaseModel):
    """Payment transaction model for sales"""
    
    __tablename__ = "payments"
    
    # Payment identification
    payment_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # Relationships
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Payment details
    payment_method = Column(String(20), nullable=False)  # cash, card, mobile_money, bank_transfer
    payment_provider = Column(String(50), nullable=True)  # visa, mastercard, ez_cash, mcash, etc.
    amount = Column(Numeric(12, 2), nullable=False)
    
    # Payment timing
    payment_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Cash payment details
    cash_received = Column(Numeric(12, 2), nullable=True)  # For cash payments
    change_given = Column(Numeric(12, 2), nullable=True)
    
    # Card payment details
    card_last_four = Column(String(4), nullable=True)
    card_type = Column(String(20), nullable=True)  # credit, debit
    authorization_code = Column(String(50), nullable=True)
    terminal_id = Column(String(50), nullable=True)
    
    # Mobile money details
    mobile_number = Column(String(20), nullable=True)
    transaction_id = Column(String(100), nullable=True)
    reference_number = Column(String(100), nullable=True)
    
    # Bank transfer details
    bank_name = Column(String(100), nullable=True)
    account_number = Column(String(50), nullable=True)
    transfer_reference = Column(String(100), nullable=True)
    
    # Payment status
    status = Column(String(20), default="completed")  # pending, completed, failed, cancelled, refunded
    is_refunded = Column(Boolean, default=False)
    refund_amount = Column(Numeric(12, 2), default=0.00)
    refund_date = Column(DateTime(timezone=True), nullable=True)
    refund_reason = Column(Text, nullable=True)
    
    # Processing information
    processed_at = Column(DateTime(timezone=True), nullable=True)
    processor_response = Column(Text, nullable=True)  # JSON response from payment processor
    
    # Additional information
    notes = Column(Text, nullable=True)
    receipt_printed = Column(Boolean, default=False)
    
    # Relationships
    sale = relationship("Sale", back_populates="payments")
    user = relationship("User")
    
    def __repr__(self):
        return f"<Payment(payment_number='{self.payment_number}', method='{self.payment_method}', amount={self.amount})>"
    
    def is_cash_payment(self) -> bool:
        """Check if this is a cash payment"""
        return self.payment_method == "cash"
    
    def is_card_payment(self) -> bool:
        """Check if this is a card payment"""
        return self.payment_method == "card"
    
    def is_mobile_payment(self) -> bool:
        """Check if this is a mobile money payment"""
        return self.payment_method == "mobile_money"
    
    def can_be_refunded(self) -> bool:
        """Check if payment can be refunded"""
        return (
            self.status == "completed" and 
            not self.is_refunded and 
            float(self.amount) > float(self.refund_amount)
        )
    
    def get_refundable_amount(self) -> float:
        """Get amount that can still be refunded"""
        return float(self.amount) - float(self.refund_amount)
    
    def get_display_method(self) -> str:
        """Get user-friendly payment method name"""
        method_names = {
            "cash": "Cash",
            "card": "Card",
            "mobile_money": "Mobile Money",
            "bank_transfer": "Bank Transfer",
            "credit": "Credit"
        }
        return method_names.get(self.payment_method, self.payment_method.title())