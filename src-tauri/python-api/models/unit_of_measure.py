"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  Unit of Measure Model                                           │
│                                                                                                  │
│  Description: Unit of measure model with decimal precision settings.                             │
│               Supports various units like pieces, kg, liters with configurable decimals.         │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Boolean, Integer, Numeric
from sqlalchemy.orm import relationship
from database.base import BaseModel


class UnitOfMeasure(BaseModel):
    """Unit of measure model for product quantities"""
    
    __tablename__ = "units_of_measure"
    
    # Basic unit information
    name = Column(String(50), nullable=False)
    abbreviation = Column(String(10), unique=True, nullable=False, index=True)
    
    # Decimal precision settings
    allow_decimals = Column(Boolean, default=True, nullable=False)
    decimal_places = Column(Integer, default=2, nullable=False)
    
    # Unit conversion (for future use)
    base_unit_id = Column(Integer, nullable=True)  # Reference to base unit
    conversion_factor = Column(Numeric(10, 6), default=1.0)  # Factor to convert to base unit
    
    # Display settings
    symbol = Column(String(10), nullable=True)  # Display symbol (e.g., "kg", "L")
    
    # Relationships
    products = relationship("Product", back_populates="unit_of_measure")
    
    def __repr__(self):
        return f"<UnitOfMeasure(name='{self.name}', abbreviation='{self.abbreviation}')>"
    
    def format_quantity(self, quantity: float) -> str:
        """Format quantity according to decimal settings"""
        if self.allow_decimals:
            return f"{quantity:.{self.decimal_places}f}"
        else:
            return str(int(quantity))
    
    def validate_quantity(self, quantity: float) -> bool:
        """Validate quantity according to decimal settings"""
        if not self.allow_decimals and quantity != int(quantity):
            return False
        return True