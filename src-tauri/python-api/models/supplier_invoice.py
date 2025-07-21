"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  Supplier Invoice Model                                          │
│                                                                                                  │
│  Description: Supplier invoice tracking for purchase management and accounts payable.            │
│               Includes photo attachment support and goods received tracking.                     │
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


class SupplierInvoice(BaseModel):
    """Supplier invoice model for purchase tracking"""
    
    __tablename__ = "supplier_invoices"
    
    # Invoice identification
    invoice_number = Column(String(100), nullable=False, index=True)
    supplier_invoice_number = Column(String(100), nullable=False)  # Supplier's invoice number
    
    # Relationships
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who entered the invoice
    
    # Invoice dates
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    received_date = Column(Date, nullable=True)  # When goods were received
    
    # Invoice amounts
    subtotal = Column(Numeric(12, 2), nullable=False, default=0.00)
    discount_amount = Column(Numeric(12, 2), default=0.00)
    tax_amount = Column(Numeric(12, 2), default=0.00)
    total_amount = Column(Numeric(12, 2), nullable=False)
    
    # Payment tracking
    paid_amount = Column(Numeric(12, 2), default=0.00)
    balance_amount = Column(Numeric(12, 2), nullable=False)
    
    # Invoice status
    status = Column(String(20), default="pending")  # pending, received, paid, overdue, cancelled
    payment_status = Column(String(20), default="unpaid")  # unpaid, partial, paid
    goods_received = Column(Boolean, default=False)
    
    # Purchase order reference
    po_number = Column(String(50), nullable=True)
    
    # Delivery information
    delivery_note_number = Column(String(50), nullable=True)
    delivery_date = Column(Date, nullable=True)
    
    # Additional information
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    
    # Attachments
    invoice_photo_path = Column(String(500), nullable=True)  # Path to invoice photo
    delivery_note_path = Column(String(500), nullable=True)  # Path to delivery note
    
    # Terms and conditions
    payment_terms = Column(String(100), nullable=True)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="invoices")
    user = relationship("User")
    payments = relationship("SupplierPayment", back_populates="invoice")
    
    def __repr__(self):
        return f"<SupplierInvoice(invoice_number='{self.invoice_number}', supplier='{self.supplier.name if self.supplier else 'N/A'}', total={self.total_amount})>"
    
    def calculate_balance(self):
        """Calculate remaining balance"""
        self.balance_amount = float(self.total_amount) - float(self.paid_amount)
        
        # Update payment status
        if float(self.paid_amount) == 0:
            self.payment_status = "unpaid"
        elif float(self.balance_amount) <= 0:
            self.payment_status = "paid"
        else:
            self.payment_status = "partial"
    
    def is_overdue(self) -> bool:
        """Check if invoice is overdue"""
        from datetime import date
        return self.due_date < date.today() and self.payment_status != "paid"
    
    def days_overdue(self) -> int:
        """Calculate days overdue"""
        from datetime import date
        if not self.is_overdue():
            return 0
        return (date.today() - self.due_date).days
    
    def is_fully_paid(self) -> bool:
        """Check if invoice is fully paid"""
        return self.payment_status == "paid"
    
    def get_outstanding_amount(self) -> float:
        """Get outstanding amount"""
        return float(self.balance_amount or 0.00)
    
    def can_receive_goods(self) -> bool:
        """Check if goods can be marked as received"""
        return self.status == "pending" and not self.goods_received
    
    def can_be_paid(self) -> bool:
        """Check if invoice can receive payments"""
        return self.status in ["pending", "received"] and self.payment_status != "paid"