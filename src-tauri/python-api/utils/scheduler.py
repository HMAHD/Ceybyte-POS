"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   Task Scheduler Service                                         │
│                                                                                                  │
│  Description: Background task scheduler for automated WhatsApp reports and reminders            │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import asyncio
import logging
from datetime import datetime, time, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from database.connection import get_db
from models.whatsapp_message import WhatsAppConfig
from utils.whatsapp_service import WhatsAppService

logger = logging.getLogger(__name__)


class TaskScheduler:
    """Simple task scheduler for WhatsApp automation"""
    
    def __init__(self):
        self.running = False
        self.tasks = []
    
    async def start(self):
        """Start the scheduler"""
        self.running = True
        logger.info("Task scheduler started")
        
        while self.running:
            try:
                await self._check_scheduled_tasks()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Scheduler error: {e}")
                await asyncio.sleep(60)
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False
        logger.info("Task scheduler stopped")
    
    async def _check_scheduled_tasks(self):
        """Check and execute scheduled tasks"""
        current_time = datetime.now().time()
        
        # Check daily report task
        await self._check_daily_report_task(current_time)
        
        # Check reminder tasks (could be expanded)
        await self._check_reminder_tasks(current_time)
    
    async def _check_daily_report_task(self, current_time: time):
        """Check if daily report should be sent"""
        try:
            db = next(get_db())
            config = db.query(WhatsAppConfig).first()
            
            if not config or not config.daily_reports_enabled:
                return
            
            # Parse configured time
            try:
                report_time_str = config.daily_report_time or "18:00"
                report_hour, report_minute = map(int, report_time_str.split(':'))
                report_time = time(report_hour, report_minute)
            except (ValueError, AttributeError):
                logger.error(f"Invalid daily report time format: {config.daily_report_time}")
                return
            
            # Check if current time matches report time (within 1 minute)
            current_minutes = current_time.hour * 60 + current_time.minute
            report_minutes = report_time.hour * 60 + report_time.minute
            
            if abs(current_minutes - report_minutes) <= 1:
                # Check if report was already sent today
                today = datetime.now().date()
                if not self._was_report_sent_today(db, today):
                    logger.info("Sending scheduled daily report")
                    whatsapp_service = WhatsAppService(db)
                    await asyncio.create_task(
                        asyncio.to_thread(whatsapp_service.send_daily_report)
                    )
            
            db.close()
            
        except Exception as e:
            logger.error(f"Error checking daily report task: {e}")
    
    async def _check_reminder_tasks(self, current_time: time):
        """Check for scheduled reminder tasks"""
        # This could be expanded to send automatic reminders
        # based on customer payment due dates, etc.
        pass
    
    def _was_report_sent_today(self, db: Session, date) -> bool:
        """Check if daily report was already sent today"""
        from models.whatsapp_message import WhatsAppMessage
        from sqlalchemy import and_, func
        
        start_of_day = datetime.combine(date, datetime.min.time())
        end_of_day = datetime.combine(date, datetime.max.time())
        
        report_count = db.query(WhatsAppMessage).filter(
            and_(
                WhatsAppMessage.message_type == "report",
                WhatsAppMessage.status == "sent",
                WhatsAppMessage.sent_at >= start_of_day,
                WhatsAppMessage.sent_at <= end_of_day
            )
        ).count()
        
        return report_count > 0


# Global scheduler instance
scheduler = TaskScheduler()


async def start_scheduler():
    """Start the background scheduler"""
    await scheduler.start()


def stop_scheduler():
    """Stop the background scheduler"""
    scheduler.stop()


# Manual task triggers
async def trigger_daily_report():
    """Manually trigger daily report"""
    try:
        db = next(get_db())
        whatsapp_service = WhatsAppService(db)
        result = whatsapp_service.send_daily_report()
        db.close()
        return result
    except Exception as e:
        logger.error(f"Error triggering daily report: {e}")
        return {"success": False, "error": str(e)}


async def trigger_customer_reminders():
    """Manually trigger customer payment reminders"""
    try:
        db = next(get_db())
        
        # Get customers with overdue payments
        from models.customer import Customer
        from sqlalchemy import and_
        
        overdue_customers = db.query(Customer).filter(
            and_(
                Customer.is_active == True,
                Customer.current_balance > 0,
                # Add logic for overdue calculation based on your business rules
            )
        ).all()
        
        whatsapp_service = WhatsAppService(db)
        results = []
        
        for customer in overdue_customers:
            if customer.whatsapp_number or customer.phone:
                result = whatsapp_service.send_customer_reminder(customer.id)
                results.append({
                    "customer": customer.name,
                    "success": result["success"],
                    "error": result.get("error")
                })
        
        db.close()
        
        return {
            "success": True,
            "total_customers": len(overdue_customers),
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Error triggering customer reminders: {e}")
        return {"success": False, "error": str(e)}