"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                     Setting Model                                                │
│                                                                                                  │
│  Description: System settings and configuration model.                                           │
│               Stores key-value pairs for application configuration.                              │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Text, Boolean
from database.base import BaseModel


class Setting(BaseModel):
    """System settings and configuration model"""
    
    __tablename__ = "settings"
    
    # Setting identification
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    
    # Setting metadata
    category = Column(String(50), nullable=False, default="general")
    data_type = Column(String(20), default="string")  # string, integer, float, boolean, json
    
    # Setting properties
    is_system = Column(Boolean, default=False)  # System settings cannot be deleted
    is_encrypted = Column(Boolean, default=False)  # Value is encrypted
    requires_restart = Column(Boolean, default=False)  # Changing requires app restart
    
    # Display information
    display_name = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    
    # Validation
    validation_regex = Column(String(500), nullable=True)
    min_value = Column(String(50), nullable=True)
    max_value = Column(String(50), nullable=True)
    allowed_values = Column(Text, nullable=True)  # JSON array of allowed values
    
    # Default value
    default_value = Column(Text, nullable=True)
    
    def __repr__(self):
        return f"<Setting(key='{self.key}', value='{self.value}', category='{self.category}')>"
    
    def get_typed_value(self):
        """Get value converted to appropriate data type"""
        if self.value is None:
            return None
            
        if self.data_type == "boolean":
            return self.value.lower() in ("true", "1", "yes", "on")
        elif self.data_type == "integer":
            try:
                return int(self.value)
            except (ValueError, TypeError):
                return 0
        elif self.data_type == "float":
            try:
                return float(self.value)
            except (ValueError, TypeError):
                return 0.0
        elif self.data_type == "json":
            try:
                import json
                return json.loads(self.value)
            except (ValueError, TypeError):
                return {}
        else:
            return self.value
    
    def set_typed_value(self, value):
        """Set value with automatic type conversion"""
        if value is None:
            self.value = None
            return
            
        if self.data_type == "boolean":
            self.value = "true" if value else "false"
        elif self.data_type == "json":
            import json
            self.value = json.dumps(value)
        else:
            self.value = str(value)
    
    def is_valid_value(self, value) -> bool:
        """Validate value against constraints"""
        if value is None:
            return True
            
        # Check allowed values
        if self.allowed_values:
            try:
                import json
                allowed = json.loads(self.allowed_values)
                if value not in allowed:
                    return False
            except (ValueError, TypeError):
                pass
        
        # Check regex validation
        if self.validation_regex and isinstance(value, str):
            import re
            if not re.match(self.validation_regex, value):
                return False
        
        # Check numeric ranges
        if self.data_type in ["integer", "float"]:
            try:
                num_value = float(value)
                if self.min_value and num_value < float(self.min_value):
                    return False
                if self.max_value and num_value > float(self.max_value):
                    return False
            except (ValueError, TypeError):
                return False
        
        return True
    
    def get_display_value(self) -> str:
        """Get user-friendly display value"""
        if self.is_encrypted and self.value:
            return "••••••••"
        
        if self.data_type == "boolean":
            return "Yes" if self.get_typed_value() else "No"
        
        return self.value or ""
    
    @classmethod
    def get_setting(cls, session, key: str, default=None):
        """Get setting value by key"""
        setting = session.query(cls).filter(cls.key == key).first()
        if setting:
            return setting.get_typed_value()
        return default
    
    @classmethod
    def set_setting(cls, session, key: str, value, category="general"):
        """Set setting value by key"""
        setting = session.query(cls).filter(cls.key == key).first()
        if setting:
            setting.set_typed_value(value)
        else:
            setting = cls(key=key, category=category)
            setting.set_typed_value(value)
            session.add(setting)
        return setting