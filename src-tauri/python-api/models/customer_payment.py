"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  Customer Payment Model                                          │
│                                                                                                  │
│  Description: Customer credit payments and collections tracking.                                 │
│               Manages payments against customer credit balances and invoices.                    │
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


class CustomerPayment(BaseModel):
    """Customer credit payment and collection tracking"""
    
    __tablename__ = "customer_payments"
    
    # Payment identification
    payment_number = Column(String(50), unique=True, nullable=False, index=True)
    receipt_number = Column(String(50), nullable=True)
    
    # Relationships
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who collected the payment
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=True)  # If payment is for specific sale
    
    # Payment details
    payment_method = Column(String(20), nullable=False, default="cash")
    amount = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Payment allocation
    allocated_amount = Column(Numeric(12, 2), default=0.00)  # Amount allocated to specific invoices
    unallocated_amount = Column(Numeric(12, 2), default=0.00)  # Advance payment amount
    
    # Cash payment details
    cash_received = Column(Numeric(12, 2), nullable=True)
    change_given = Column(Numeric(12, 2), nullable=True)
    
    # Mobile money details
    mobile_number = Column(String(20), nullable=True)
    transaction_id = Column(String(100), nullable=True)
    reference_number = Column(String(100), nullable=True)
    
    # Bank details
    bank_name = Column(String(100), nullable=True)
    cheque_number = Column(String(50), nullable=True)
    cheque_date = Column(DateTime(timezone=True), nullable=True)
    
    # Payment status
    status = Column(String(20), default="completed")  # pending, completed, bounced, cancelled
    is_advance_payment = Column(Boolean, default=False)  # Payment made in advance
    
    # Collection information
    collected_by = Column(String(100), nullable=True)  # Name of person who collected
    collection_route = Column(String(50), nullable=True)
    
    # Additional information
    notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    
    # Receipt information
    receipt_printed = Column(Boolean, default=False)
    receipt_sent_whatsapp = Column(Boolean, default=False)
    
    # Relationships
    customer = relationship("Customer", back_populates="payments")
    user = relationship("User")
    sale = relationship("Sale")
    
    def __repr__(self):
        return f"<CustomerPayment(payment_number='{self.payment_number}', customer='{self.customer.name if self.customer else 'N/A'}', amount={self.amount})>"
    
    def calculate_allocation(self):
        """Calculate allocated and unallocated amounts"""
        # This would be implemented based on payment allocation logic
        # For now, assume full amount is allocated unless it's an advance payment
        if self.is_advance_payment:
            self.allocated_amount = 0.00
            self.unallocated_amount = float(self.amount)
        else:
            self.allocated_amount = float(self.amount)
            self.unallocated_amount = 0.00
    
    def is_cash_payment(self) -> bool:
        """Check if this is a cash payment"""
        return self.payment_method == "cash"
    
    def is_cheque_payment(self) -> bool:
        """Check if this is a cheque payment"""
        return self.payment_method == "cheque"
    
    def is_mobile_payment(self) -> bool:
        """Check if this is a mobile money payment"""
        return self.payment_method == "mobile_money"
    
    def can_be_cancelled(self) -> bool:
        """Check if payment can be cancelled"""
        return self.status in ["pending", "completed"] and not self.is_advance_payment
    
    def get_display_method(self) -> str:
        """Get user-friendly payment method name"""
        method_names = {
            "cash": "Cash",
            "cheque": "Cheque", 
            "mobile_money": "Mobile Money",
            "bank_transfer": "Bank Transfer"
        }
        return method_names.get(self.payment_method, self.payment_method.title())