"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  Supplier Payment Model                                          │
│                                                                                                  │
│  Description: Supplier payment tracking for accounts payable management.                         │
│               Handles payments to suppliers against invoices and purchase orders.                │
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


class SupplierPayment(BaseModel):
    """Supplier payment model for accounts payable"""
    
    __tablename__ = "supplier_payments"
    
    # Payment identification
    payment_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # Relationships
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("supplier_invoices.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who made the payment
    
    # Payment details
    payment_method = Column(String(20), nullable=False, default="cash")
    amount = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Cash payment details
    cash_paid = Column(Numeric(12, 2), nullable=True)
    
    # Cheque details
    cheque_number = Column(String(50), nullable=True)
    cheque_date = Column(Date, nullable=True)
    bank_name = Column(String(100), nullable=True)
    
    # Bank transfer details
    transfer_reference = Column(String(100), nullable=True)
    account_number = Column(String(50), nullable=True)
    
    # Mobile money details
    mobile_number = Column(String(20), nullable=True)
    transaction_id = Column(String(100), nullable=True)
    reference_number = Column(String(100), nullable=True)
    
    # Payment status
    status = Column(String(20), default="completed")  # pending, completed, bounced, cancelled
    
    # Payment allocation
    allocated_amount = Column(Numeric(12, 2), default=0.00)  # Amount allocated to specific invoices
    advance_amount = Column(Numeric(12, 2), default=0.00)    # Advance payment amount
    
    # Additional information
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    
    # Receipt information
    receipt_number = Column(String(50), nullable=True)
    receipt_printed = Column(Boolean, default=False)
    
    # Approval workflow
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approval_notes = Column(Text, nullable=True)
    
    # Relationships
    supplier = relationship("Supplier", back_populates="payments")
    invoice = relationship("SupplierInvoice", back_populates="payments")
    user = relationship("User", foreign_keys=[user_id])
    approver = relationship("User", foreign_keys=[approved_by])
    
    def __repr__(self):
        return f"<SupplierPayment(payment_number='{self.payment_number}', supplier='{self.supplier.name if self.supplier else 'N/A'}', amount={self.amount})>"
    
    def calculate_allocation(self):
        """Calculate allocated and advance amounts"""
        if self.invoice_id:
            # Payment is for specific invoice
            self.allocated_amount = float(self.amount)
            self.advance_amount = 0.00
        else:
            # Advance payment
            self.allocated_amount = 0.00
            self.advance_amount = float(self.amount)
    
    def is_cash_payment(self) -> bool:
        """Check if this is a cash payment"""
        return self.payment_method == "cash"
    
    def is_cheque_payment(self) -> bool:
        """Check if this is a cheque payment"""
        return self.payment_method == "cheque"
    
    def is_bank_transfer(self) -> bool:
        """Check if this is a bank transfer"""
        return self.payment_method == "bank_transfer"
    
    def is_mobile_payment(self) -> bool:
        """Check if this is a mobile money payment"""
        return self.payment_method == "mobile_money"
    
    def is_advance_payment(self) -> bool:
        """Check if this is an advance payment"""
        return self.invoice_id is None
    
    def can_be_cancelled(self) -> bool:
        """Check if payment can be cancelled"""
        return self.status in ["pending", "completed"]
    
    def requires_approval(self) -> bool:
        """Check if payment requires approval"""
        # Payments above certain amount might require approval
        return float(self.amount) > 10000.00  # Example threshold
    
    def is_approved(self) -> bool:
        """Check if payment is approved"""
        return self.approved_by is not None
    
    def get_display_method(self) -> str:
        """Get user-friendly payment method name"""
        method_names = {
            "cash": "Cash",
            "cheque": "Cheque",
            "bank_transfer": "Bank Transfer", 
            "mobile_money": "Mobile Money"
        }
        return method_names.get(self.payment_method, self.payment_method.title())