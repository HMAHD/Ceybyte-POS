"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                    Sale Item Model                                               │
│                                                                                                  │
│  Description: Individual line items within a sale transaction.                                   │
│               Tracks quantity, pricing, and discounts for each product sold.                     │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Numeric, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database.base import BaseModel


class SaleItem(BaseModel):
    """Individual line item within a sale"""
    
    __tablename__ = "sale_items"
    
    # Relationships
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Product information (snapshot at time of sale)
    product_name = Column(String(200), nullable=False)  # Product name at time of sale
    product_sku = Column(String(50), nullable=True)
    product_barcode = Column(String(50), nullable=True)
    
    # Quantity and pricing
    quantity = Column(Numeric(10, 3), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)  # Price per unit at time of sale
    original_price = Column(Numeric(10, 2), nullable=False)  # Original product price
    cost_price = Column(Numeric(10, 2), nullable=False)  # Cost price at time of sale
    
    # Discounts
    discount_amount = Column(Numeric(10, 2), default=0.00)
    discount_percentage = Column(Numeric(5, 2), default=0.00)
    
    # Line totals
    line_total = Column(Numeric(12, 2), nullable=False)  # quantity * unit_price - discount
    line_cost = Column(Numeric(12, 2), nullable=False)   # quantity * cost_price
    line_profit = Column(Numeric(12, 2), nullable=False) # line_total - line_cost
    
    # Tax information
    tax_rate = Column(Numeric(5, 2), default=0.00)
    tax_amount = Column(Numeric(10, 2), default=0.00)
    
    # Item settings
    is_negotiated = Column(Boolean, default=False)  # Was price negotiated?
    is_refunded = Column(Boolean, default=False)
    refunded_quantity = Column(Numeric(10, 3), default=0.000)
    
    # Unit of measure (snapshot)
    unit_name = Column(String(50), nullable=False)
    unit_abbreviation = Column(String(10), nullable=False)
    
    # Line number for ordering
    line_number = Column(Integer, nullable=False, default=1)
    
    # Relationships
    sale = relationship("Sale", back_populates="sale_items")
    product = relationship("Product", back_populates="sale_items")
    
    def __repr__(self):
        return f"<SaleItem(product='{self.product_name}', qty={self.quantity}, total={self.line_total})>"
    
    def calculate_line_total(self):
        """Calculate line total with discounts"""
        gross_total = float(self.quantity) * float(self.unit_price)
        
        # Apply discount
        if self.discount_percentage > 0:
            self.discount_amount = (gross_total * float(self.discount_percentage)) / 100
        
        self.line_total = gross_total - float(self.discount_amount)
        
        # Calculate cost and profit
        self.line_cost = float(self.quantity) * float(self.cost_price)
        self.line_profit = float(self.line_total) - float(self.line_cost)
        
        # Calculate tax
        if self.tax_rate > 0:
            self.tax_amount = (float(self.line_total) * float(self.tax_rate)) / 100
    
    def get_profit_margin(self) -> float:
        """Calculate profit margin percentage for this line"""
        if float(self.line_cost) == 0:
            return 0.0
        return (float(self.line_profit) / float(self.line_cost)) * 100
    
    def get_discount_amount_per_unit(self) -> float:
        """Get discount amount per unit"""
        if float(self.quantity) == 0:
            return 0.0
        return float(self.discount_amount) / float(self.quantity)
    
    def can_be_refunded(self) -> bool:
        """Check if item can be refunded"""
        return not self.is_refunded and float(self.refunded_quantity) < float(self.quantity)