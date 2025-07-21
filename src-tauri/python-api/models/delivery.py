"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                     Delivery Model                                               │
│                                                                                                  │
│  Description: Delivery tracking model for three-wheeler and other delivery services.             │
│               Includes driver information, route tracking, and delivery status.                  │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import BaseModel


class Delivery(BaseModel):
    """Delivery tracking model for order deliveries"""
    
    __tablename__ = "deliveries"
    
    # Delivery identification
    delivery_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # Relationships
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who created the delivery
    
    # Delivery scheduling
    scheduled_date = Column(Date, nullable=False)
    scheduled_time_start = Column(String(10), nullable=True)  # HH:MM format
    scheduled_time_end = Column(String(10), nullable=True)    # HH:MM format
    
    # Delivery address
    delivery_address = Column(Text, nullable=False)
    delivery_area = Column(String(50), nullable=True, index=True)
    delivery_village = Column(String(50), nullable=True)
    delivery_city = Column(String(50), nullable=True)
    
    # Contact information
    contact_person = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    special_instructions = Column(Text, nullable=True)
    
    # Driver information
    driver_name = Column(String(100), nullable=True)
    driver_phone = Column(String(20), nullable=True)
    driver_license = Column(String(50), nullable=True)
    vehicle_number = Column(String(20), nullable=True)
    vehicle_type = Column(String(50), default="three_wheeler")  # three_wheeler, motorcycle, van, truck
    
    # Delivery costs
    delivery_fee = Column(Numeric(10, 2), default=0.00)
    fuel_cost = Column(Numeric(10, 2), default=0.00)
    driver_payment = Column(Numeric(10, 2), default=0.00)
    
    # Route information
    route_name = Column(String(100), nullable=True)
    estimated_distance_km = Column(Numeric(5, 2), nullable=True)
    estimated_duration_minutes = Column(Integer, nullable=True)
    
    # Delivery status
    status = Column(String(20), default="scheduled")  # scheduled, dispatched, in_transit, delivered, failed, cancelled
    
    # Timing tracking
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    
    # Delivery confirmation
    delivered_to = Column(String(100), nullable=True)  # Name of person who received
    delivery_notes = Column(Text, nullable=True)
    signature_required = Column(Boolean, default=False)
    signature_path = Column(String(500), nullable=True)  # Path to signature image
    
    # Payment collection (for COD)
    collect_payment = Column(Boolean, default=False)
    payment_collected = Column(Boolean, default=False)
    collected_amount = Column(Numeric(12, 2), default=0.00)
    
    # Delivery proof
    photo_path = Column(String(500), nullable=True)  # Delivery proof photo
    
    # Failure information
    failure_reason = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    next_retry_date = Column(Date, nullable=True)
    
    # Customer feedback
    customer_rating = Column(Integer, nullable=True)  # 1-5 rating
    customer_feedback = Column(Text, nullable=True)
    
    # Relationships
    sale = relationship("Sale")
    customer = relationship("Customer", back_populates="deliveries")
    user = relationship("User")
    
    def __repr__(self):
        return f"<Delivery(delivery_number='{self.delivery_number}', status='{self.status}', customer='{self.customer.name if self.customer else 'N/A'}')>"
    
    def can_be_dispatched(self) -> bool:
        """Check if delivery can be dispatched"""
        return self.status == "scheduled"
    
    def can_be_delivered(self) -> bool:
        """Check if delivery can be marked as delivered"""
        return self.status in ["dispatched", "in_transit"]
    
    def can_be_cancelled(self) -> bool:
        """Check if delivery can be cancelled"""
        return self.status in ["scheduled", "dispatched"]
    
    def is_overdue(self) -> bool:
        """Check if delivery is overdue"""
        from datetime import date
        return self.scheduled_date < date.today() and self.status not in ["delivered", "cancelled"]
    
    def get_status_display(self) -> str:
        """Get user-friendly status display"""
        status_names = {
            "scheduled": "Scheduled",
            "dispatched": "Dispatched",
            "in_transit": "In Transit",
            "delivered": "Delivered",
            "failed": "Failed",
            "cancelled": "Cancelled"
        }
        return status_names.get(self.status, self.status.title())
    
    def get_status_color(self) -> str:
        """Get color code for status"""
        colors = {
            "scheduled": "#6b7280",    # Gray
            "dispatched": "#2563eb",   # Blue
            "in_transit": "#d97706",   # Orange
            "delivered": "#16a34a",    # Green
            "failed": "#dc2626",       # Red
            "cancelled": "#7c2d12"     # Dark red
        }
        return colors.get(self.status, "#6b7280")
    
    def calculate_total_cost(self) -> float:
        """Calculate total delivery cost"""
        return float(self.delivery_fee) + float(self.fuel_cost) + float(self.driver_payment)
    
    def get_delivery_duration(self) -> int:
        """Get delivery duration in minutes"""
        if self.dispatched_at and self.delivered_at:
            duration = self.delivered_at - self.dispatched_at
            return int(duration.total_seconds() / 60)
        return 0
    
    def get_full_address(self) -> str:
        """Get formatted full delivery address"""
        parts = [self.delivery_address]
        if self.delivery_village:
            parts.append(self.delivery_village)
        if self.delivery_area:
            parts.append(self.delivery_area)
        if self.delivery_city:
            parts.append(self.delivery_city)
        
        return ", ".join(parts)