"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                     Terminal Model                                               │
│                                                                                                  │
│  Description: Terminal/workstation model for multi-terminal network support.                     │
│               Tracks terminal status, configuration, and sync information.                       │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import BaseModel


class Terminal(BaseModel):
    """Terminal/workstation model for multi-terminal support"""
    
    __tablename__ = "terminals"
    
    # Terminal identification
    terminal_id = Column(String(50), unique=True, nullable=False, index=True)
    terminal_name = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=True)
    
    # Terminal type and role
    terminal_type = Column(String(20), default="pos")  # pos, admin, mobile
    is_main_terminal = Column(Boolean, default=False)
    
    # Network information
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    mac_address = Column(String(17), nullable=True)
    hostname = Column(String(100), nullable=True)
    
    # Hardware information
    hardware_id = Column(String(100), nullable=True)  # Unique hardware identifier
    cpu_info = Column(String(200), nullable=True)
    memory_gb = Column(Integer, nullable=True)
    storage_gb = Column(Integer, nullable=True)
    
    # Software information
    os_version = Column(String(100), nullable=True)
    app_version = Column(String(20), nullable=True)
    last_update_check = Column(DateTime(timezone=True), nullable=True)
    
    # Terminal status
    status = Column(String(20), default="offline")  # online, offline, maintenance, error
    last_seen = Column(DateTime(timezone=True), nullable=True)
    last_heartbeat = Column(DateTime(timezone=True), nullable=True)
    
    # Sync information
    last_sync_time = Column(DateTime(timezone=True), nullable=True)
    sync_status = Column(String(20), default="pending")  # synced, pending, failed, conflict
    pending_sync_count = Column(Integer, default=0)
    
    # Configuration
    configuration = Column(JSON, nullable=True)  # Terminal-specific settings
    
    # Printer configuration
    printer_name = Column(String(100), nullable=True)
    printer_type = Column(String(50), nullable=True)  # thermal, inkjet, laser
    printer_width_mm = Column(Integer, default=80)
    
    # UPS information
    ups_connected = Column(Boolean, default=False)
    ups_battery_level = Column(Integer, nullable=True)  # 0-100
    ups_status = Column(String(20), nullable=True)  # online, battery, low_battery, critical
    
    # Performance metrics
    avg_response_time_ms = Column(Integer, nullable=True)
    error_count_24h = Column(Integer, default=0)
    
    # Location information
    location = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    
    # Relationships
    sales = relationship("Sale", back_populates="terminal")
    
    def __repr__(self):
        return f"<Terminal(terminal_id='{self.terminal_id}', name='{self.terminal_name}', status='{self.status}')>"
    
    def is_online(self) -> bool:
        """Check if terminal is currently online"""
        return self.status == "online"
    
    def is_main(self) -> bool:
        """Check if this is the main terminal"""
        return self.is_main_terminal
    
    def needs_sync(self) -> bool:
        """Check if terminal needs synchronization"""
        return self.sync_status in ["pending", "failed"] or self.pending_sync_count > 0
    
    def update_heartbeat(self):
        """Update terminal heartbeat timestamp"""
        self.last_heartbeat = func.now()
        self.last_seen = func.now()
        if self.status == "offline":
            self.status = "online"
    
    def set_offline(self):
        """Mark terminal as offline"""
        self.status = "offline"
    
    def get_uptime_status(self) -> str:
        """Get terminal uptime status"""
        if not self.last_seen:
            return "Never connected"
        
        from datetime import datetime, timedelta
        now = datetime.now()
        time_diff = now - self.last_seen
        
        if time_diff < timedelta(minutes=5):
            return "Online"
        elif time_diff < timedelta(hours=1):
            return f"Last seen {time_diff.seconds // 60} minutes ago"
        elif time_diff < timedelta(days=1):
            return f"Last seen {time_diff.seconds // 3600} hours ago"
        else:
            return f"Last seen {time_diff.days} days ago"
    
    def get_sync_status_display(self) -> str:
        """Get user-friendly sync status"""
        status_names = {
            "synced": "Up to date",
            "pending": f"Pending ({self.pending_sync_count} items)",
            "failed": "Sync failed",
            "conflict": "Sync conflict"
        }
        return status_names.get(self.sync_status, self.sync_status.title())