"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                 Festival Calendar Model                                          │
│                                                                                                  │
│  Description: Sri Lankan festival and holiday calendar model.                                    │
│               Includes Poya days, public holidays, and business-relevant dates.                  │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from sqlalchemy import Column, String, Date, Boolean, Text, Integer
from database.base import BaseModel


class FestivalCalendar(BaseModel):
    """Sri Lankan festival and holiday calendar model"""
    
    __tablename__ = "festival_calendar"
    
    # Festival identification
    name = Column(String(200), nullable=False)
    name_si = Column(String(200), nullable=True)
    name_ta = Column(String(200), nullable=True)
    
    # Date information
    date = Column(Date, nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    
    # Festival type
    type = Column(String(50), nullable=False, index=True)  # poya_day, public_holiday, religious, cultural, business
    category = Column(String(50), nullable=True)  # buddhist, hindu, christian, muslim, national, etc.
    
    # Festival properties
    is_public_holiday = Column(Boolean, default=False)
    is_bank_holiday = Column(Boolean, default=False)
    is_poya_day = Column(Boolean, default=False)
    affects_business = Column(Boolean, default=True)  # Whether it affects business operations
    
    # Business impact
    expected_sales_impact = Column(String(20), nullable=True)  # high, medium, low, negative
    stock_up_recommended = Column(Boolean, default=False)
    delivery_affected = Column(Boolean, default=False)
    
    # Timing information
    is_recurring = Column(Boolean, default=True)  # Recurring annually
    lunar_based = Column(Boolean, default=False)  # Based on lunar calendar (like Poya days)
    
    # Additional information
    description = Column(Text, nullable=True)
    business_notes = Column(Text, nullable=True)  # Business-specific notes
    
    # Greeting and marketing
    greeting_message_en = Column(Text, nullable=True)
    greeting_message_si = Column(Text, nullable=True)
    greeting_message_ta = Column(Text, nullable=True)
    
    # Notification settings
    notify_days_before = Column(Integer, default=1)  # Days before to send notifications
    send_customer_greetings = Column(Boolean, default=False)
    send_stock_reminders = Column(Boolean, default=False)
    
    def __repr__(self):
        return f"<FestivalCalendar(name='{self.name}', date='{self.date}', type='{self.type}')>"
    
    def get_name(self, language="en") -> str:
        """Get festival name in specified language"""
        if language == "si" and self.name_si:
            return self.name_si
        elif language == "ta" and self.name_ta:
            return self.name_ta
        else:
            return self.name
    
    def get_greeting_message(self, language="en") -> str:
        """Get greeting message in specified language"""
        if language == "si" and self.greeting_message_si:
            return self.greeting_message_si
        elif language == "ta" and self.greeting_message_ta:
            return self.greeting_message_ta
        else:
            return self.greeting_message_en or f"Happy {self.name}!"
    
    def is_today(self) -> bool:
        """Check if festival is today"""
        from datetime import date
        return self.date == date.today()
    
    def is_upcoming(self, days: int = 7) -> bool:
        """Check if festival is upcoming within specified days"""
        from datetime import date, timedelta
        today = date.today()
        return today < self.date <= today + timedelta(days=days)
    
    def days_until(self) -> int:
        """Get number of days until festival"""
        from datetime import date
        today = date.today()
        if self.date < today:
            return -1  # Past
        return (self.date - today).days
    
    def should_send_notification(self) -> bool:
        """Check if notification should be sent today"""
        return self.days_until() == self.notify_days_before
    
    def get_business_impact_color(self) -> str:
        """Get color code for business impact level"""
        colors = {
            "high": "#16a34a",      # Green (positive impact)
            "medium": "#eab308",    # Yellow
            "low": "#6b7280",       # Gray
            "negative": "#dc2626"   # Red
        }
        return colors.get(self.expected_sales_impact, "#6b7280")
    
    @classmethod
    def get_upcoming_festivals(cls, session, days: int = 30):
        """Get upcoming festivals within specified days"""
        from datetime import date, timedelta
        today = date.today()
        end_date = today + timedelta(days=days)
        
        return session.query(cls).filter(
            cls.date >= today,
            cls.date <= end_date
        ).order_by(cls.date).all()
    
    @classmethod
    def get_todays_festivals(cls, session):
        """Get today's festivals"""
        from datetime import date
        today = date.today()
        
        return session.query(cls).filter(cls.date == today).all()
    
    @classmethod
    def is_business_day(cls, session, check_date=None):
        """Check if given date is a business day (not a holiday)"""
        from datetime import date
        if check_date is None:
            check_date = date.today()
        
        # Check if it's a weekend (Saturday = 5, Sunday = 6)
        if check_date.weekday() >= 5:
            return False
        
        # Check if it's a public holiday
        holiday = session.query(cls).filter(
            cls.date == check_date,
            cls.is_public_holiday == True
        ).first()
        
        return holiday is None