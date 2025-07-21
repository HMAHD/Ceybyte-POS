"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                       Sale Model                                                 │
│                                                                                                  │
│  Description: Sale transaction model with support for multiple payment methods.                  │
│               Includes cash, card, mobile money, and credit sales.                               │
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


class Sale(BaseModel):
    """Sale transaction model"""
    
    __tablename__ = "sales"
    
    # Sale identification
    sale_number = Column(String(50), unique=True, nullable=False, index=True)
    receipt_number = Column(String(50), nullable=True)
    
    # Sale relationships
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    terminal_id = Column(Integer, ForeignKey("terminals.id"), nullable=True)
    
    # Sale timing
    sale_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Sale amounts
    subtotal = Column(Numeric(12, 2), nullable=False, default=0.00)
    discount_amount = Column(Numeric(12, 2), default=0.00)
    discount_percentage = Column(Numeric(5, 2), default=0.00)
    tax_amount = Column(Numeric(12, 2), default=0.00)
    total_amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    
    # Payment information
    payment_method = Column(String(20), nullable=False, default="cash")  # cash, card, mobile, credit, mixed
    amount_paid = Column(Numeric(12, 2), default=0.00)
    change_amount = Column(Numeric(12, 2), default=0.00)
    
    # Sale status
    status = Column(String(20), default="completed")  # pending, completed, cancelled, refunded, held
    is_credit_sale = Column(Boolean, default=False)
    is_refunded = Column(Boolean, default=False)
    
    # Credit sale information
    credit_due_date = Column(DateTime(timezone=True), nullable=True)
    credit_paid_amount = Column(Numeric(12, 2), default=0.00)
    credit_balance = Column(Numeric(12, 2), default=0.00)
    
    # Additional information
    notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)  # Staff notes, not printed
    
    # Receipt settings
    receipt_printed = Column(Boolean, default=False)
    receipt_sent_whatsapp = Column(Boolean, default=False)
    receipt_emailed = Column(Boolean, default=False)
    
    # Delivery information
    delivery_required = Column(Boolean, default=False)
    delivery_address = Column(Text, nullable=True)
    delivery_fee = Column(Numeric(10, 2), default=0.00)
    
    # System information
    pos_version = Column(String(20), nullable=True)
    sync_status = Column(String(20), default="synced")  # synced, pending, failed
    
    # Relationships
    customer = relationship("Customer", back_populates="sales")
    user = relationship("User", back_populates="sales")
    terminal = relationship("Terminal", back_populates="sales")
    sale_items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="sale", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Sale(sale_number='{self.sale_number}', total={self.total_amount}, status='{self.status}')>"
    
    def calculate_totals(self):
        """Calculate sale totals from sale items"""
        self.subtotal = sum(item.line_total for item in self.sale_items)
        
        # Apply discount
        if self.discount_percentage > 0:
            self.discount_amount = (self.subtotal * self.discount_percentage) / 100
        
        # Calculate tax (assuming tax is calculated after discount)
        taxable_amount = self.subtotal - self.discount_amount
        self.tax_amount = sum(
            (item.line_total * item.product.tax_rate / 100) 
            for item in self.sale_items 
            if item.product.tax_rate > 0
        )
        
        # Calculate total
        self.total_amount = self.subtotal - self.discount_amount + self.tax_amount + self.delivery_fee
        
        # Update credit balance for credit sales
        if self.is_credit_sale:
            self.credit_balance = self.total_amount - self.credit_paid_amount
    
    def is_fully_paid(self) -> bool:
        """Check if sale is fully paid"""
        if not self.is_credit_sale:
            return True
        return self.credit_balance <= 0
    
    def get_outstanding_amount(self) -> float:
        """Get outstanding credit amount"""
        if not self.is_credit_sale:
            return 0.0
        return float(self.credit_balance or 0.0)
    
    def can_be_refunded(self) -> bool:
        """Check if sale can be refunded"""
        return self.status == "completed" and not self.is_refunded