"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                     Product Model                                                │
│                                                                                                  │
│  Description: Product model with multi-language support, barcode, and pricing.                   │
│               Includes inventory tracking and supplier information.                              │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.base import BaseModel


class Product(BaseModel):
    """Product model for inventory management"""
    
    __tablename__ = "products"
    
    # Basic product information
    name_en = Column(String(200), nullable=False, index=True)
    name_si = Column(String(200), nullable=True)
    name_ta = Column(String(200), nullable=True)
    
    # Product identification
    sku = Column(String(50), unique=True, nullable=True, index=True)
    barcode = Column(String(50), unique=True, nullable=True, index=True)
    internal_code = Column(String(50), nullable=True, index=True)
    
    # Category and classification
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    unit_of_measure_id = Column(Integer, ForeignKey("units_of_measure.id"), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    
    # Pricing
    cost_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    selling_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    wholesale_price = Column(Numeric(10, 2), nullable=True)
    special_price = Column(Numeric(10, 2), nullable=True)
    
    # Pricing settings
    is_negotiable = Column(Boolean, default=False)
    min_selling_price = Column(Numeric(10, 2), nullable=True)  # Minimum allowed price
    markup_percentage = Column(Numeric(5, 2), nullable=True)
    
    # Inventory
    current_stock = Column(Numeric(10, 3), default=0.000)
    minimum_stock = Column(Numeric(10, 3), default=0.000)
    maximum_stock = Column(Numeric(10, 3), nullable=True)
    reorder_level = Column(Numeric(10, 3), nullable=True)
    
    # Product settings
    is_active = Column(Boolean, default=True)
    is_service = Column(Boolean, default=False)  # Service items don't affect inventory
    track_inventory = Column(Boolean, default=True)
    allow_negative_stock = Column(Boolean, default=False)
    
    # Tax settings
    tax_rate = Column(Numeric(5, 2), default=0.00)  # VAT percentage
    tax_inclusive = Column(Boolean, default=True)
    
    # Additional information
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    
    # Supplier information
    supplier_product_code = Column(String(50), nullable=True)
    supplier_price = Column(Numeric(10, 2), nullable=True)
    last_purchase_date = Column(DateTime(timezone=True), nullable=True)
    last_purchase_price = Column(Numeric(10, 2), nullable=True)
    
    # Display settings
    image_url = Column(String(500), nullable=True)
    sort_order = Column(Integer, default=0)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    unit_of_measure = relationship("UnitOfMeasure", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    sale_items = relationship("SaleItem", back_populates="product")
    
    def __repr__(self):
        return f"<Product(name_en='{self.name_en}', sku='{self.sku}', stock={self.current_stock})>"
    
    def get_name(self, language="en") -> str:
        """Get product name in specified language"""
        name_field = f"name_{language}"
        return getattr(self, name_field) or self.name_en
    
    def get_price_for_level(self, price_level="retail") -> float:
        """Get price based on customer price level"""
        if price_level == "wholesale" and self.wholesale_price:
            return float(self.wholesale_price)
        elif price_level == "special" and self.special_price:
            return float(self.special_price)
        else:
            return float(self.selling_price)
    
    def is_low_stock(self) -> bool:
        """Check if product is below minimum stock level"""
        if not self.track_inventory:
            return False
        return float(self.current_stock) <= float(self.minimum_stock or 0)
    
    def is_out_of_stock(self) -> bool:
        """Check if product is out of stock"""
        if not self.track_inventory:
            return False
        return float(self.current_stock) <= 0
    
    def can_sell_quantity(self, quantity: float) -> bool:
        """Check if we can sell the requested quantity"""
        if not self.track_inventory:
            return True
        if self.allow_negative_stock:
            return True
        return float(self.current_stock) >= quantity
    
    def calculate_profit_margin(self) -> float:
        """Calculate profit margin percentage"""
        if float(self.cost_price) == 0:
            return 0.0
        profit = float(self.selling_price) - float(self.cost_price)
        return (profit / float(self.cost_price)) * 100