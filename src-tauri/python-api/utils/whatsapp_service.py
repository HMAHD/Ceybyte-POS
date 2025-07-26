"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   WhatsApp Service                                               │
│                                                                                                  │
│  Description: WhatsApp Business API integration service for sending receipts,                   │
│               reminders, reports and customer communications                                     │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.whatsapp_message import WhatsAppMessage, WhatsAppConfig
from models.sale import Sale
from models.customer import Customer
from utils.receipt_templates import format_receipt_for_whatsapp
import logging

logger = logging.getLogger(__name__)


class WhatsAppService:
    """WhatsApp Business API service for CeybytePOS"""
    
    def __init__(self, db: Session):
        self.db = db
        self.config = self._get_config()
    
    def _get_config(self) -> Optional[WhatsAppConfig]:
        """Get WhatsApp configuration from database"""
        return self.db.query(WhatsAppConfig).first()
    
    def _send_message(self, phone: str, message: str, message_type: str = "text") -> Dict[str, Any]:
        """Send message via WhatsApp Business API"""
        if not self.config:
            return {"success": False, "error": "WhatsApp not configured"}
        
        # Format phone number (ensure it starts with country code)
        formatted_phone = self._format_phone_number(phone)
        
        payload = {
            "messaging_product": "whatsapp",
            "to": formatted_phone,
            "type": "text",
            "text": {
                "body": message
            }
        }
        
        headers = {
            "Authorization": f"Bearer {self.config.api_token}",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(
                f"{self.config.api_url}/messages",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "message_id": result.get("messages", [{}])[0].get("id"),
                    "response": result
                }
            else:
                error_msg = f"API Error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {"success": False, "error": error_msg}
                
        except requests.exceptions.RequestException as e:
            error_msg = f"Network Error: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
    
    def _format_phone_number(self, phone: str) -> str:
        """Format phone number for WhatsApp API (Sri Lankan format)"""
        if not phone:
            return ""
        
        # Remove all non-digit characters
        digits_only = ''.join(filter(str.isdigit, phone))
        
        # Handle Sri Lankan phone numbers
        if digits_only.startswith('94'):
            return digits_only
        elif digits_only.startswith('0'):
            return '94' + digits_only[1:]
        elif len(digits_only) == 9:
            return '94' + digits_only
        else:
            return digits_only
    
    def send_receipt(self, sale_id: int, customer_phone: str = None) -> Dict[str, Any]:
        """Send receipt via WhatsApp"""
        try:
            sale = self.db.query(Sale).filter(Sale.id == sale_id).first()
            if not sale:
                return {"success": False, "error": "Sale not found"}
            
            # Use customer phone if not provided
            phone = customer_phone
            if not phone and sale.customer:
                phone = sale.customer.whatsapp_number or sale.customer.phone
            
            if not phone:
                return {"success": False, "error": "No phone number available"}
            
            # Format receipt for WhatsApp
            receipt_text = format_receipt_for_whatsapp(sale)
            
            # Send message
            result = self._send_message(phone, receipt_text, "receipt")
            
            # Log message
            whatsapp_msg = WhatsAppMessage(
                recipient_phone=phone,
                recipient_name=sale.customer.name if sale.customer else "Walk-in Customer",
                message_type="receipt",
                message_content=receipt_text,
                status="sent" if result["success"] else "failed",
                error_message=result.get("error"),
                sale_id=sale_id,
                customer_id=sale.customer_id,
                sent_at=datetime.utcnow() if result["success"] else None
            )
            
            self.db.add(whatsapp_msg)
            
            # Update sale receipt status
            if result["success"]:
                sale.receipt_sent_whatsapp = True
            
            self.db.commit()
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending receipt: {str(e)}")
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def send_daily_report(self, report_date: datetime = None) -> Dict[str, Any]:
        """Send daily sales report to owner"""
        try:
            if not self.config or not self.config.owner_phone:
                return {"success": False, "error": "Owner phone not configured"}
            
            if not report_date:
                report_date = datetime.now().date()
            
            # Generate daily report
            report_text = self._generate_daily_report(report_date)
            
            # Send message
            result = self._send_message(self.config.owner_phone, report_text, "report")
            
            # Log message
            whatsapp_msg = WhatsAppMessage(
                recipient_phone=self.config.owner_phone,
                recipient_name="Owner",
                message_type="report",
                message_content=report_text,
                status="sent" if result["success"] else "failed",
                error_message=result.get("error"),
                sent_at=datetime.utcnow() if result["success"] else None
            )
            
            self.db.add(whatsapp_msg)
            self.db.commit()
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending daily report: {str(e)}")
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def send_customer_reminder(self, customer_id: int, message_template: str = None) -> Dict[str, Any]:
        """Send payment reminder to customer"""
        try:
            customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
            if not customer:
                return {"success": False, "error": "Customer not found"}
            
            phone = customer.whatsapp_number or customer.phone
            if not phone:
                return {"success": False, "error": "No phone number for customer"}
            
            # Use template or default message
            if not message_template:
                message_template = self.config.reminder_template if self.config else None
            
            if not message_template:
                message_template = self._get_default_reminder_template()
            
            # Format message with customer data
            message = self._format_reminder_message(customer, message_template)
            
            # Send message
            result = self._send_message(phone, message, "reminder")
            
            # Log message
            whatsapp_msg = WhatsAppMessage(
                recipient_phone=phone,
                recipient_name=customer.name,
                message_type="reminder",
                message_content=message,
                status="sent" if result["success"] else "failed",
                error_message=result.get("error"),
                customer_id=customer_id,
                sent_at=datetime.utcnow() if result["success"] else None
            )
            
            self.db.add(whatsapp_msg)
            self.db.commit()
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending reminder: {str(e)}")
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def send_bulk_message(self, message: str, area_filter: str = None, village_filter: str = None) -> Dict[str, Any]:
        """Send bulk message to customers with area/village filtering"""
        try:
            # Build query with filters
            query = self.db.query(Customer).filter(Customer.is_active == True)
            
            if area_filter:
                query = query.filter(Customer.area == area_filter)
            
            if village_filter:
                query = query.filter(Customer.village == village_filter)
            
            # Only customers with WhatsApp numbers
            customers = query.filter(
                (Customer.whatsapp_number.isnot(None)) | 
                (Customer.phone.isnot(None))
            ).all()
            
            results = []
            success_count = 0
            
            for customer in customers:
                phone = customer.whatsapp_number or customer.phone
                if phone:
                    result = self._send_message(phone, message, "bulk")
                    
                    # Log message
                    whatsapp_msg = WhatsAppMessage(
                        recipient_phone=phone,
                        recipient_name=customer.name,
                        message_type="bulk",
                        message_content=message,
                        status="sent" if result["success"] else "failed",
                        error_message=result.get("error"),
                        customer_id=customer.id,
                        sent_at=datetime.utcnow() if result["success"] else None
                    )
                    
                    self.db.add(whatsapp_msg)
                    
                    if result["success"]:
                        success_count += 1
                    
                    results.append({
                        "customer": customer.name,
                        "phone": phone,
                        "success": result["success"],
                        "error": result.get("error")
                    })
            
            self.db.commit()
            
            return {
                "success": True,
                "total_sent": success_count,
                "total_customers": len(customers),
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Error sending bulk message: {str(e)}")
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def send_backup_file(self, backup_file_path: str, description: str = None) -> Dict[str, Any]:
        """Send backup file via WhatsApp (as text summary)"""
        try:
            if not self.config or not self.config.owner_phone:
                return {"success": False, "error": "Owner phone not configured"}
            
            # Create backup summary message
            message = f"*CeybytePOS Backup Created*\n\n"
            message += f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
            message += f"File: {backup_file_path}\n"
            
            if description:
                message += f"Description: {description}\n"
            
            message += f"\nBackup completed successfully.\n"
            message += f"Please ensure backup file is stored safely."
            
            # Send message
            result = self._send_message(self.config.owner_phone, message, "backup")
            
            # Log message
            whatsapp_msg = WhatsAppMessage(
                recipient_phone=self.config.owner_phone,
                recipient_name="Owner",
                message_type="backup",
                message_content=message,
                status="sent" if result["success"] else "failed",
                error_message=result.get("error"),
                sent_at=datetime.utcnow() if result["success"] else None
            )
            
            self.db.add(whatsapp_msg)
            self.db.commit()
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending backup notification: {str(e)}")
            self.db.rollback()
            return {"success": False, "error": str(e)}
    
    def _generate_daily_report(self, report_date) -> str:
        """Generate daily sales report text"""
        from sqlalchemy import func, and_
        
        start_date = datetime.combine(report_date, datetime.min.time())
        end_date = datetime.combine(report_date, datetime.max.time())
        
        # Get sales data
        sales_query = self.db.query(Sale).filter(
            and_(
                Sale.sale_date >= start_date,
                Sale.sale_date <= end_date,
                Sale.status == "completed"
            )
        )
        
        total_sales = sales_query.count()
        total_amount = sales_query.with_entities(func.sum(Sale.total_amount)).scalar() or 0
        cash_sales = sales_query.filter(Sale.payment_method == "cash").with_entities(func.sum(Sale.total_amount)).scalar() or 0
        credit_sales = sales_query.filter(Sale.is_credit_sale == True).with_entities(func.sum(Sale.total_amount)).scalar() or 0
        
        # Format report
        report = f"*Daily Sales Report*\n"
        report += f"Date: {report_date.strftime('%Y-%m-%d')}\n\n"
        report += f"Total Sales: {total_sales}\n"
        report += f"Total Amount: Rs. {total_amount:,.2f}\n"
        report += f"Cash Sales: Rs. {cash_sales:,.2f}\n"
        report += f"Credit Sales: Rs. {credit_sales:,.2f}\n\n"
        
        # Top selling products (optional)
        report += f"Generated by CeybytePOS\n"
        report += f"Time: {datetime.now().strftime('%H:%M:%S')}"
        
        return report
    
    def _get_default_reminder_template(self) -> str:
        """Get default reminder message template"""
        return """*Payment Reminder*

Dear {customer_name},

This is a friendly reminder about your outstanding balance:

Amount Due: Rs. {balance:,.2f}
Due Date: {due_date}

Please visit our shop or contact us to settle your account.

Thank you for your business!

{business_name}
Phone: {business_phone}"""
    
    def _format_reminder_message(self, customer: Customer, template: str) -> str:
        """Format reminder message with customer data"""
        # Calculate due date (approximate)
        due_date = "Please check with shop"
        if customer.credit_days:
            due_date = (datetime.now() + timedelta(days=customer.credit_days)).strftime('%Y-%m-%d')
        
        return template.format(
            customer_name=customer.name,
            balance=customer.current_balance or 0,
            due_date=due_date,
            business_name=self.config.business_name if self.config else "CeybytePOS",
            business_phone=self.config.business_phone if self.config else ""
        )
    
    def get_message_history(self, customer_id: int = None, limit: int = 50) -> List[WhatsAppMessage]:
        """Get WhatsApp message history"""
        query = self.db.query(WhatsAppMessage).order_by(WhatsAppMessage.created_at.desc())
        
        if customer_id:
            query = query.filter(WhatsAppMessage.customer_id == customer_id)
        
        return query.limit(limit).all()