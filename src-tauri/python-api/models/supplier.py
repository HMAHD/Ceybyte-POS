"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                     Supplier Model                                               │
│                                                                                                  │
│  Description: Supplier model for managing vendor information and credit terms.                   │
│               Includes payment terms, visit schedules, and contact information.                  │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, Date
from sqlalchemy.orm import relationship
from database.base import BaseModel


class Supplier(BaseModel):
    """Supplier model for vendor management"""
    
    __tablename__ = "suppliers"
    
    # Basic supplier information
    name = Column(String(100), nullable=False, index=True)
    company_name = Column(String(100), nullable=True)
    contact_person = Column(String(100), nullable=True)
    
    # Contact information
    phone = Column(String(20), nullable=True)
    mobile = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    
    # Address information
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    city = Column(String(50), nullable=True)
    postal_code = Column(String(10), nullable=True)
    
    # Business information
    business_registration = Column(String(50), nullable=True)
    vat_number = Column(String(20), nullable=True)
    
    # Credit terms
    credit_limit = Column(Numeric(12, 2), default=0.00)
    payment_terms_days = Column(Integer, default=30)  # Net payment days
    
    # Visit schedule
    visit_day = Column(String(10), nullable=True)  # monday, tuesday, etc.
    visit_frequency = Column(String(20), default="weekly")  # weekly, biweekly, monthly
    last_visit_date = Column(Date, nullable=True)
    next_visit_date = Column(Date, nullable=True)
    
    # Financial tracking
    current_balance = Column(Numeric(12, 2), default=0.00)  # Amount we owe
    
    # Settings
    is_active = Column(Boolean, default=True)
    auto_create_po = Column(Boolean, default=False)  # Auto create purchase orders
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    invoices = relationship("SupplierInvoice", back_populates="supplier")
    payments = relationship("SupplierPayment", back_populates="supplier")
    products = relationship("Product", back_populates="supplier")
    
    def __repr__(self):
        return f"<Supplier(name='{self.name}', balance={self.current_balance})>"
    
    def get_outstanding_amount(self) -> float:
        """Calculate total outstanding amount owed to supplier"""
        return float(self.current_balance or 0.00)
    
    def is_credit_limit_exceeded(self, additional_amount: float = 0) -> bool:
        """Check if adding amount would exceed credit limit"""
        total_amount = self.get_outstanding_amount() + additional_amount
        return total_amount > float(self.credit_limit or 0.00)