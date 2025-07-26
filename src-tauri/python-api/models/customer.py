"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                     Customer Model                                               │
│                                                                                                  │
│  Description: Customer model for managing customer information and credit sales.                 │
│               Includes area/village grouping for collection routes and credit limits.            │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, Date
from sqlalchemy.orm import relationship
from database.base import BaseModel


class Customer(BaseModel):
    """Customer model for customer management and credit sales"""
    
    __tablename__ = "customers"
    
    # Basic customer information
    name = Column(String(100), nullable=False, index=True)
    display_name = Column(String(100), nullable=True)  # Nickname or preferred name
    
    # Contact information
    phone = Column(String(20), nullable=True, index=True)
    mobile = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    whatsapp_number = Column(String(20), nullable=True)
    
    # Address information
    address_line1 = Column(String(200), nullable=True)
    address_line2 = Column(String(200), nullable=True)
    area = Column(String(50), nullable=True, index=True)  # For collection routes
    village = Column(String(50), nullable=True, index=True)
    city = Column(String(50), nullable=True)
    postal_code = Column(String(10), nullable=True)
    
    # Business information (for business customers)
    business_name = Column(String(100), nullable=True)
    business_registration = Column(String(50), nullable=True)
    vat_number = Column(String(20), nullable=True)
    
    # Credit settings
    credit_limit = Column(Numeric(12, 2), default=0.00)
    credit_days = Column(Integer, default=30)  # Credit period in days
    current_balance = Column(Numeric(12, 2), default=0.00)  # Outstanding amount
    
    # Customer preferences
    preferred_language = Column(String(5), default="en")  # en, si, ta
    price_level = Column(String(20), default="retail")  # retail, wholesale, special
    
    # Collection information
    collection_day = Column(String(10), nullable=True)  # monday, tuesday, etc.
    collection_route = Column(String(50), nullable=True)
    last_payment_date = Column(Date, nullable=True)
    
    # Customer status
    is_active = Column(Boolean, default=True)
    is_blacklisted = Column(Boolean, default=False)
    blacklist_reason = Column(Text, nullable=True)
    
    # Loyalty and rewards
    loyalty_points = Column(Integer, default=0)
    total_purchases = Column(Numeric(12, 2), default=0.00)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Relationships
    sales = relationship("Sale", back_populates="customer")
    payments = relationship("CustomerPayment", back_populates="customer")
    deliveries = relationship("Delivery", back_populates="customer")
    whatsapp_messages = relationship("WhatsAppMessage", back_populates="customer", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Customer(name='{self.name}', balance={self.current_balance})>"
    
    def get_outstanding_amount(self) -> float:
        """Calculate total outstanding amount"""
        return float(self.current_balance or 0.00)
    
    def is_credit_limit_exceeded(self, additional_amount: float = 0) -> bool:
        """Check if adding amount would exceed credit limit"""
        total_amount = self.get_outstanding_amount() + additional_amount
        return total_amount > float(self.credit_limit or 0.00)
    
    def get_display_name(self) -> str:
        """Get preferred display name"""
        return self.display_name or self.name
    
    def get_full_address(self) -> str:
        """Get formatted full address"""
        parts = []
        if self.address_line1:
            parts.append(self.address_line1)
        if self.address_line2:
            parts.append(self.address_line2)
        if self.village:
            parts.append(self.village)
        if self.area:
            parts.append(self.area)
        if self.city:
            parts.append(self.city)
        if self.postal_code:
            parts.append(self.postal_code)
        
        return ", ".join(parts)