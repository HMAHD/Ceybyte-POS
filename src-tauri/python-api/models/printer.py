"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                     Printer Model                                                │
│                                                                                                  │
│  Description: Thermal printer configuration and queue management model.                          │
│               Supports ESC/POS thermal printers with multi-language printing.                    │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, Enum
from sqlalchemy.sql import func
from database.base import BaseModel
import enum


class PrinterType(enum.Enum):
    """Printer connection types"""
    USB = "usb"
    NETWORK = "network"
    SERIAL = "serial"
    BLUETOOTH = "bluetooth"


class PrintJobStatus(enum.Enum):
    """Print job status"""
    PENDING = "pending"
    PRINTING = "printing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Printer(BaseModel):
    """Thermal printer configuration model"""
    
    __tablename__ = "printers"
    
    # Printer identification
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Connection settings
    printer_type = Column(Enum(PrinterType), nullable=False, default=PrinterType.USB)
    connection_string = Column(String(500), nullable=False)  # USB path, IP:port, COM port, etc.
    
    # Printer capabilities
    paper_width = Column(Integer, default=80)  # Paper width in mm (58, 80)
    characters_per_line = Column(Integer, default=48)  # Characters per line
    supports_graphics = Column(Boolean, default=True)
    supports_barcode = Column(Boolean, default=True)
    supports_qr_code = Column(Boolean, default=True)
    
    # Language settings
    default_codepage = Column(String(20), default="cp437")  # ESC/POS codepage
    supports_unicode = Column(Boolean, default=False)
    
    # Printer status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    last_test_date = Column(DateTime(timezone=True), nullable=True)
    last_test_success = Column(Boolean, default=False)
    
    # Print settings
    cut_paper = Column(Boolean, default=True)
    open_drawer = Column(Boolean, default=False)
    print_logo = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<Printer(name='{self.name}', type='{self.printer_type.value}', active={self.is_active})>"


class PrintJob(BaseModel):
    """Print job queue model"""
    
    __tablename__ = "print_jobs"
    
    # Job identification
    job_type = Column(String(50), nullable=False)  # receipt, label, report
    reference_id = Column(String(100), nullable=True)  # Sale ID, product ID, etc.
    
    # Print content
    content = Column(Text, nullable=False)  # ESC/POS commands or template data
    template_name = Column(String(100), nullable=True)
    
    # Job settings
    printer_id = Column(Integer, nullable=True)  # Specific printer, null for default
    copies = Column(Integer, default=1)
    priority = Column(Integer, default=5)  # 1-10, lower is higher priority
    
    # Job status
    status = Column(Enum(PrintJobStatus), default=PrintJobStatus.PENDING)
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Timing
    scheduled_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<PrintJob(type='{self.job_type}', status='{self.status.value}', ref='{self.reference_id}')>"
    
    def can_retry(self) -> bool:
        """Check if job can be retried"""
        return self.status == PrintJobStatus.FAILED and self.retry_count < self.max_retries
    
    def mark_failed(self, error: str):
        """Mark job as failed with error message"""
        self.status = PrintJobStatus.FAILED
        self.error_message = error
        self.retry_count += 1
        self.completed_at = func.now()
    
    def mark_completed(self):
        """Mark job as completed"""
        self.status = PrintJobStatus.COMPLETED
        self.completed_at = func.now()