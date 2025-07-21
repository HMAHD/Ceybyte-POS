"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                    Category Model                                                │
│                                                                                                  │
│  Description: Product category model with parent-child hierarchy support.                        │
│               Includes default negotiable pricing settings per category.                         │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from database.base import BaseModel


class Category(BaseModel):
    """Product category model with hierarchical structure"""
    
    __tablename__ = "categories"
    
    # Basic category information
    name_en = Column(String(100), nullable=False)
    name_si = Column(String(100), nullable=True)
    name_ta = Column(String(100), nullable=True)
    
    # Category hierarchy
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    sort_order = Column(Integer, default=0)
    
    # Category settings
    is_negotiable_default = Column(Boolean, default=False)
    icon = Column(String(50), nullable=True)  # Icon name for UI
    color = Column(String(7), nullable=True)  # Hex color code
    
    # Description
    description = Column(Text, nullable=True)
    
    # Relationships
    parent = relationship("Category", remote_side="Category.id", back_populates="children")
    children = relationship("Category", back_populates="parent")
    products = relationship("Product", back_populates="category")
    
    def __repr__(self):
        return f"<Category(name_en='{self.name_en}', parent_id={self.parent_id})>"
    
    def get_full_path(self, language="en") -> str:
        """Get full category path (e.g., 'Electronics > Mobile Phones')"""
        name_field = f"name_{language}"
        name = getattr(self, name_field) or self.name_en
        
        if self.parent:
            return f"{self.parent.get_full_path(language)} > {name}"
        return name
    
    def get_all_children(self):
        """Get all descendant categories recursively"""
        children = []
        for child in self.children:
            children.append(child)
            children.extend(child.get_all_children())
        return children