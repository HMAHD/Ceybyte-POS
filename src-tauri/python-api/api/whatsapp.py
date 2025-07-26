"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   WhatsApp API Routes                                            │
│                                                                                                  │
│  Description: FastAPI routes for WhatsApp Business API integration                              │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date

from database.connection import get_db
from models.whatsapp_message import WhatsAppMessage, WhatsAppConfig
from models.customer import Customer
from utils.whatsapp_service import WhatsAppService

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


# Pydantic models for request/response
class WhatsAppConfigRequest(BaseModel):
    api_url: str
    api_token: str
    business_phone: str
    business_name: str
    auto_send_receipts: bool = False
    daily_reports_enabled: bool = False
    customer_reminders_enabled: bool = False
    backup_sharing_enabled: bool = False
    daily_report_time: str = "18:00"
    owner_phone: Optional[str] = None
    receipt_template: Optional[str] = None
    reminder_template: Optional[str] = None
    greeting_template: Optional[str] = None


class WhatsAppConfigResponse(BaseModel):
    id: int
    api_url: str
    business_phone: str
    business_name: str
    auto_send_receipts: bool
    daily_reports_enabled: bool
    customer_reminders_enabled: bool
    backup_sharing_enabled: bool
    daily_report_time: str
    owner_phone: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SendReceiptRequest(BaseModel):
    sale_id: int
    phone: Optional[str] = None


class SendReminderRequest(BaseModel):
    customer_id: int
    message_template: Optional[str] = None


class BulkMessageRequest(BaseModel):
    message: str
    area_filter: Optional[str] = None
    village_filter: Optional[str] = None


class BackupNotificationRequest(BaseModel):
    backup_file_path: str
    description: Optional[str] = None


class WhatsAppMessageResponse(BaseModel):
    id: int
    recipient_phone: str
    recipient_name: Optional[str]
    message_type: str
    status: str
    error_message: Optional[str]
    sent_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/config", response_model=Optional[WhatsAppConfigResponse])
async def get_whatsapp_config(db: Session = Depends(get_db)):
    """Get WhatsApp configuration"""
    config = db.query(WhatsAppConfig).first()
    return config


@router.post("/config", response_model=WhatsAppConfigResponse)
async def save_whatsapp_config(
    config_data: WhatsAppConfigRequest,
    db: Session = Depends(get_db)
):
    """Save or update WhatsApp configuration"""
    try:
        # Check if config exists
        existing_config = db.query(WhatsAppConfig).first()
        
        if existing_config:
            # Update existing config
            for field, value in config_data.dict().items():
                setattr(existing_config, field, value)
            existing_config.updated_at = datetime.utcnow()
            config = existing_config
        else:
            # Create new config
            config = WhatsAppConfig(**config_data.dict())
            db.add(config)
        
        db.commit()
        db.refresh(config)
        
        return config
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving config: {str(e)}")


@router.post("/send-receipt")
async def send_receipt(
    request: SendReceiptRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send receipt via WhatsApp"""
    try:
        whatsapp_service = WhatsAppService(db)
        
        # Send in background to avoid blocking
        background_tasks.add_task(
            whatsapp_service.send_receipt,
            request.sale_id,
            request.phone
        )
        
        return {"success": True, "message": "Receipt sending initiated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending receipt: {str(e)}")


@router.post("/send-daily-report")
async def send_daily_report(
    report_date: Optional[date] = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db)
):
    """Send daily sales report to owner"""
    try:
        whatsapp_service = WhatsAppService(db)
        
        # Convert date to datetime if provided
        report_datetime = datetime.combine(report_date, datetime.min.time()) if report_date else None
        
        # Send in background
        background_tasks.add_task(
            whatsapp_service.send_daily_report,
            report_datetime
        )
        
        return {"success": True, "message": "Daily report sending initiated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending daily report: {str(e)}")


@router.post("/send-reminder")
async def send_customer_reminder(
    request: SendReminderRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send payment reminder to customer"""
    try:
        whatsapp_service = WhatsAppService(db)
        
        # Send in background
        background_tasks.add_task(
            whatsapp_service.send_customer_reminder,
            request.customer_id,
            request.message_template
        )
        
        return {"success": True, "message": "Reminder sending initiated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending reminder: {str(e)}")


@router.post("/send-bulk-message")
async def send_bulk_message(
    request: BulkMessageRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send bulk message to customers with area/village filtering"""
    try:
        whatsapp_service = WhatsAppService(db)
        
        # Send in background
        background_tasks.add_task(
            whatsapp_service.send_bulk_message,
            request.message,
            request.area_filter,
            request.village_filter
        )
        
        return {"success": True, "message": "Bulk message sending initiated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending bulk message: {str(e)}")


@router.post("/send-backup-notification")
async def send_backup_notification(
    request: BackupNotificationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send backup file notification via WhatsApp"""
    try:
        whatsapp_service = WhatsAppService(db)
        
        # Send in background
        background_tasks.add_task(
            whatsapp_service.send_backup_file,
            request.backup_file_path,
            request.description
        )
        
        return {"success": True, "message": "Backup notification sending initiated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending backup notification: {str(e)}")


@router.get("/messages", response_model=List[WhatsAppMessageResponse])
async def get_message_history(
    customer_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get WhatsApp message history"""
    try:
        whatsapp_service = WhatsAppService(db)
        messages = whatsapp_service.get_message_history(customer_id, limit)
        return messages
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting message history: {str(e)}")


@router.get("/customers-with-whatsapp")
async def get_customers_with_whatsapp(
    area: Optional[str] = None,
    village: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get customers with WhatsApp numbers for bulk messaging"""
    try:
        query = db.query(Customer).filter(Customer.is_active == True)
        
        # Apply filters
        if area:
            query = query.filter(Customer.area == area)
        if village:
            query = query.filter(Customer.village == village)
        
        # Only customers with phone numbers
        customers = query.filter(
            (Customer.whatsapp_number.isnot(None)) | 
            (Customer.phone.isnot(None))
        ).all()
        
        result = []
        for customer in customers:
            phone = customer.whatsapp_number or customer.phone
            result.append({
                "id": customer.id,
                "name": customer.name,
                "phone": phone,
                "area": customer.area,
                "village": customer.village,
                "credit_balance": float(customer.current_balance or 0)
            })
        
        return {"success": True, "customers": result, "total": len(result)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting customers: {str(e)}")


@router.get("/areas")
async def get_customer_areas(db: Session = Depends(get_db)):
    """Get unique customer areas for filtering"""
    try:
        areas = db.query(Customer.area).filter(
            Customer.area.isnot(None),
            Customer.is_active == True
        ).distinct().all()
        
        return {"success": True, "areas": [area[0] for area in areas]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting areas: {str(e)}")


@router.get("/villages")
async def get_customer_villages(
    area: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get unique customer villages for filtering"""
    try:
        query = db.query(Customer.village).filter(
            Customer.village.isnot(None),
            Customer.is_active == True
        )
        
        if area:
            query = query.filter(Customer.area == area)
        
        villages = query.distinct().all()
        
        return {"success": True, "villages": [village[0] for village in villages]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting villages: {str(e)}")


@router.post("/test-connection")
async def test_whatsapp_connection(db: Session = Depends(get_db)):
    """Test WhatsApp API connection"""
    try:
        config = db.query(WhatsAppConfig).first()
        if not config:
            raise HTTPException(status_code=400, detail="WhatsApp not configured")
        
        # Test with a simple message to business phone
        whatsapp_service = WhatsAppService(db)
        test_message = "CeybytePOS WhatsApp Test\n\nThis is a test message to verify WhatsApp integration is working correctly."
        
        result = whatsapp_service._send_message(
            config.business_phone,
            test_message,
            "test"
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error testing connection: {str(e)}")


@router.post("/trigger-daily-report")
async def trigger_daily_report_manually(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Manually trigger daily report"""
    try:
        from utils.scheduler import trigger_daily_report
        
        # Trigger in background
        background_tasks.add_task(trigger_daily_report)
        
        return {"success": True, "message": "Daily report trigger initiated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error triggering daily report: {str(e)}")


@router.post("/trigger-customer-reminders")
async def trigger_customer_reminders_manually(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Manually trigger customer payment reminders"""
    try:
        from utils.scheduler import trigger_customer_reminders
        
        # Trigger in background
        background_tasks.add_task(trigger_customer_reminders)
        
        return {"success": True, "message": "Customer reminders trigger initiated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error triggering reminders: {str(e)}")