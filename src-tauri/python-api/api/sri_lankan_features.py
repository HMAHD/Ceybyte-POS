"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                Sri Lankan Features API                                           │
│                                                                                                  │
│  Description: API endpoints for Sri Lankan specific business features including                  │
│               festival calendar, VAT calculations, mobile payments, and delivery tracking.       │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from database.connection import get_db
from models.festival_calendar import FestivalCalendar
from models.delivery import Delivery
from models.customer import Customer
from models.sale import Sale

router = APIRouter(prefix="/api/sri-lankan", tags=["Sri Lankan Features"])


# Pydantic models for request/response
class FestivalResponse(BaseModel):
    id: int
    name: str
    name_si: Optional[str]
    name_ta: Optional[str]
    date: str
    type: str
    category: Optional[str]
    is_public_holiday: bool
    is_poya_day: bool
    expected_sales_impact: Optional[str]
    greeting_message_en: Optional[str]
    greeting_message_si: Optional[str]
    greeting_message_ta: Optional[str]
    days_until: int
    
    class Config:
        from_attributes = True


class DeliveryRequest(BaseModel):
    sale_id: int
    customer_id: int
    scheduled_date: str
    delivery_address: str
    delivery_area: Optional[str] = None
    delivery_village: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    vehicle_type: str = "three_wheeler"
    delivery_fee: float = 0.0
    special_instructions: Optional[str] = None


class DeliveryResponse(BaseModel):
    id: int
    delivery_number: str
    sale_id: int
    customer_id: int
    scheduled_date: str
    delivery_address: str
    delivery_area: Optional[str]
    driver_name: Optional[str]
    vehicle_number: Optional[str]
    status: str
    delivery_fee: float
    
    class Config:
        from_attributes = True


class VATCalculationRequest(BaseModel):
    amount: float
    vat_rate: float = 18.0  # Sri Lankan VAT rate


class VATCalculationResponse(BaseModel):
    subtotal: float
    vat_amount: float
    total: float
    vat_rate: float


class MobilePaymentProvider(BaseModel):
    id: str
    name: str
    name_si: Optional[str]
    name_ta: Optional[str]
    logo_url: Optional[str]
    is_active: bool
    fee_percentage: float
    min_amount: float
    max_amount: float


# Festival Calendar Endpoints
@router.get("/festivals", response_model=List[FestivalResponse])
async def get_festivals(
    year: Optional[int] = Query(None, description="Year to filter festivals"),
    upcoming_days: Optional[int] = Query(30, description="Number of upcoming days to include"),
    type: Optional[str] = Query(None, description="Festival type filter"),
    db: Session = Depends(get_db)
):
    """Get festivals and holidays"""
    try:
        # If year is specified, ensure data exists for that year
        if year:
            existing_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == year).count()
            if existing_count == 0:
                from utils.sri_lankan_data import initialize_sri_lankan_festivals_for_year
                initialize_sri_lankan_festivals_for_year(db, year)
            
            query = db.query(FestivalCalendar).filter(FestivalCalendar.year == year)
        else:
            # Get current year and upcoming festivals
            today = date.today()
            current_year = today.year
            
            # Ensure current year data exists
            existing_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == current_year).count()
            if existing_count == 0:
                from utils.sri_lankan_data import initialize_sri_lankan_festivals_for_year
                initialize_sri_lankan_festivals_for_year(db, current_year)
            
            end_date = today + timedelta(days=upcoming_days)
            
            # If end_date crosses into next year, ensure next year data exists too
            if end_date.year > current_year:
                next_year_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == end_date.year).count()
                if next_year_count == 0:
                    from utils.sri_lankan_data import initialize_sri_lankan_festivals_for_year
                    initialize_sri_lankan_festivals_for_year(db, end_date.year)
            
            query = db.query(FestivalCalendar).filter(
                FestivalCalendar.date >= today,
                FestivalCalendar.date <= end_date
            )
        
        if type:
            query = query.filter(FestivalCalendar.type == type)
        
        festivals = query.order_by(FestivalCalendar.date).all()
        
        # Add days_until calculation
        result = []
        for festival in festivals:
            festival_dict = {
                "id": festival.id,
                "name": festival.name,
                "name_si": festival.name_si,
                "name_ta": festival.name_ta,
                "date": festival.date.isoformat(),
                "type": festival.type,
                "category": festival.category,
                "is_public_holiday": festival.is_public_holiday,
                "is_poya_day": festival.is_poya_day,
                "expected_sales_impact": festival.expected_sales_impact,
                "greeting_message_en": festival.greeting_message_en,
                "greeting_message_si": festival.greeting_message_si,
                "greeting_message_ta": festival.greeting_message_ta,
                "days_until": festival.days_until()
            }
            result.append(festival_dict)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching festivals: {str(e)}")


@router.get("/festivals/today", response_model=List[FestivalResponse])
async def get_todays_festivals(db: Session = Depends(get_db)):
    """Get today's festivals and holidays"""
    try:
        today = date.today()
        current_year = today.year
        
        # Ensure current year data exists
        existing_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == current_year).count()
        if existing_count == 0:
            from utils.sri_lankan_data import initialize_sri_lankan_festivals_for_year
            initialize_sri_lankan_festivals_for_year(db, current_year)
        
        festivals = FestivalCalendar.get_todays_festivals(db)
        
        result = []
        for festival in festivals:
            festival_dict = {
                "id": festival.id,
                "name": festival.name,
                "name_si": festival.name_si,
                "name_ta": festival.name_ta,
                "date": festival.date.isoformat(),
                "type": festival.type,
                "category": festival.category,
                "is_public_holiday": festival.is_public_holiday,
                "is_poya_day": festival.is_poya_day,
                "expected_sales_impact": festival.expected_sales_impact,
                "greeting_message_en": festival.greeting_message_en,
                "greeting_message_si": festival.greeting_message_si,
                "greeting_message_ta": festival.greeting_message_ta,
                "days_until": 0
            }
            result.append(festival_dict)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching today's festivals: {str(e)}")


@router.get("/festivals/poya-days")
async def get_poya_days(
    year: Optional[int] = Query(None, description="Year to get Poya days for"),
    db: Session = Depends(get_db)
):
    """Get Poya days for the year"""
    try:
        if not year:
            year = date.today().year
        
        # Ensure data exists for the requested year
        existing_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == year).count()
        if existing_count == 0:
            from utils.sri_lankan_data import initialize_sri_lankan_festivals_for_year
            initialize_sri_lankan_festivals_for_year(db, year)
        
        poya_days = db.query(FestivalCalendar).filter(
            FestivalCalendar.year == year,
            FestivalCalendar.is_poya_day == True
        ).order_by(FestivalCalendar.date).all()
        
        return [
            {
                "id": poya.id,
                "name": poya.name,
                "name_si": poya.name_si,
                "name_ta": poya.name_ta,
                "date": poya.date.isoformat(),
                "is_public_holiday": poya.is_public_holiday
            }
            for poya in poya_days
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Poya days: {str(e)}")


@router.get("/business-day-check")
async def check_business_day(
    check_date: Optional[str] = Query(None, description="Date to check (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Check if a date is a business day"""
    try:
        if check_date:
            check_date_obj = datetime.strptime(check_date, "%Y-%m-%d").date()
        else:
            check_date_obj = date.today()
        
        # Ensure data exists for the check date year
        check_year = check_date_obj.year
        existing_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == check_year).count()
        if existing_count == 0:
            from utils.sri_lankan_data import initialize_sri_lankan_festivals_for_year
            initialize_sri_lankan_festivals_for_year(db, check_year)
        
        is_business_day = FestivalCalendar.is_business_day(db, check_date_obj)
        
        return {
            "date": check_date_obj.isoformat(),
            "is_business_day": is_business_day,
            "is_weekend": check_date_obj.weekday() >= 5,
            "day_of_week": check_date_obj.strftime("%A")
        }
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking business day: {str(e)}")


@router.post("/festivals/initialize-year/{year}")
async def initialize_festivals_for_year(
    year: int,
    db: Session = Depends(get_db)
):
    """Initialize festival data for a specific year"""
    try:
        # Check if data already exists
        existing_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == year).count()
        
        if existing_count > 0:
            return {
                "message": f"Festival data already exists for {year}",
                "year": year,
                "existing_count": existing_count,
                "action": "skipped"
            }
        
        # Initialize data for the year
        from utils.sri_lankan_data import initialize_sri_lankan_festivals_for_year
        initialize_sri_lankan_festivals_for_year(db, year)
        
        # Count newly created festivals
        new_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == year).count()
        
        return {
            "message": f"Successfully initialized festival data for {year}",
            "year": year,
            "festivals_created": new_count,
            "action": "created"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing festivals for {year}: {str(e)}")


@router.post("/festivals/auto-update")
async def auto_update_festivals(db: Session = Depends(get_db)):
    """Auto-update festival data for current and next year"""
    try:
        current_year = date.today().year
        next_year = current_year + 1
        
        results = []
        
        # Check and initialize current year
        current_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == current_year).count()
        if current_count == 0:
            from utils.sri_lankan_data import initialize_sri_lankan_festivals_for_year
            initialize_sri_lankan_festivals_for_year(db, current_year)
            new_current_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == current_year).count()
            results.append({
                "year": current_year,
                "action": "created",
                "count": new_current_count
            })
        else:
            results.append({
                "year": current_year,
                "action": "exists",
                "count": current_count
            })
        
        # Check and initialize next year
        next_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == next_year).count()
        if next_count == 0:
            from utils.sri_lankan_data import initialize_sri_lankan_festivals_for_year
            initialize_sri_lankan_festivals_for_year(db, next_year)
            new_next_count = db.query(FestivalCalendar).filter(FestivalCalendar.year == next_year).count()
            results.append({
                "year": next_year,
                "action": "created",
                "count": new_next_count
            })
        else:
            results.append({
                "year": next_year,
                "action": "exists",
                "count": next_count
            })
        
        return {
            "message": "Festival data auto-update completed",
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in auto-update: {str(e)}")


# Delivery Tracking Endpoints
@router.post("/deliveries", response_model=DeliveryResponse)
async def create_delivery(
    delivery_data: DeliveryRequest,
    db: Session = Depends(get_db)
):
    """Create a new delivery"""
    try:
        # Generate delivery number
        delivery_count = db.query(Delivery).count()
        delivery_number = f"DEL{delivery_count + 1:06d}"
        
        # Parse scheduled date
        scheduled_date_obj = datetime.strptime(delivery_data.scheduled_date, "%Y-%m-%d").date()
        
        delivery = Delivery(
            delivery_number=delivery_number,
            sale_id=delivery_data.sale_id,
            customer_id=delivery_data.customer_id,
            user_id=1,  # TODO: Get from auth context
            scheduled_date=scheduled_date_obj,
            delivery_address=delivery_data.delivery_address,
            delivery_area=delivery_data.delivery_area,
            delivery_village=delivery_data.delivery_village,
            contact_person=delivery_data.contact_person,
            contact_phone=delivery_data.contact_phone,
            driver_name=delivery_data.driver_name,
            driver_phone=delivery_data.driver_phone,
            vehicle_number=delivery_data.vehicle_number,
            vehicle_type=delivery_data.vehicle_type,
            delivery_fee=delivery_data.delivery_fee,
            special_instructions=delivery_data.special_instructions
        )
        
        db.add(delivery)
        db.commit()
        db.refresh(delivery)
        
        return DeliveryResponse(
            id=delivery.id,
            delivery_number=delivery.delivery_number,
            sale_id=delivery.sale_id,
            customer_id=delivery.customer_id,
            scheduled_date=delivery.scheduled_date.isoformat(),
            delivery_address=delivery.delivery_address,
            delivery_area=delivery.delivery_area,
            driver_name=delivery.driver_name,
            vehicle_number=delivery.vehicle_number,
            status=delivery.status,
            delivery_fee=float(delivery.delivery_fee)
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating delivery: {str(e)}")


@router.get("/deliveries", response_model=List[DeliveryResponse])
async def get_deliveries(
    status: Optional[str] = Query(None, description="Filter by delivery status"),
    area: Optional[str] = Query(None, description="Filter by delivery area"),
    date_from: Optional[str] = Query(None, description="Start date filter (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="End date filter (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Get deliveries with optional filters"""
    try:
        query = db.query(Delivery)
        
        if status:
            query = query.filter(Delivery.status == status)
        
        if area:
            query = query.filter(Delivery.delivery_area == area)
        
        if date_from:
            date_from_obj = datetime.strptime(date_from, "%Y-%m-%d").date()
            query = query.filter(Delivery.scheduled_date >= date_from_obj)
        
        if date_to:
            date_to_obj = datetime.strptime(date_to, "%Y-%m-%d").date()
            query = query.filter(Delivery.scheduled_date <= date_to_obj)
        
        deliveries = query.order_by(Delivery.scheduled_date.desc()).all()
        
        return [
            DeliveryResponse(
                id=delivery.id,
                delivery_number=delivery.delivery_number,
                sale_id=delivery.sale_id,
                customer_id=delivery.customer_id,
                scheduled_date=delivery.scheduled_date.isoformat(),
                delivery_address=delivery.delivery_address,
                delivery_area=delivery.delivery_area,
                driver_name=delivery.driver_name,
                vehicle_number=delivery.vehicle_number,
                status=delivery.status,
                delivery_fee=float(delivery.delivery_fee)
            )
            for delivery in deliveries
        ]
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching deliveries: {str(e)}")


@router.put("/deliveries/{delivery_id}/status")
async def update_delivery_status(
    delivery_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update delivery status"""
    try:
        delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
        if not delivery:
            raise HTTPException(status_code=404, detail="Delivery not found")
        
        valid_statuses = ["scheduled", "dispatched", "in_transit", "delivered", "failed", "cancelled"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        delivery.status = status
        
        # Update timestamps based on status
        if status == "dispatched" and not delivery.dispatched_at:
            delivery.dispatched_at = datetime.now()
        elif status == "delivered" and not delivery.delivered_at:
            delivery.delivered_at = datetime.now()
        
        db.commit()
        
        return {"message": "Delivery status updated successfully", "status": status}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating delivery status: {str(e)}")


# VAT Calculation Endpoints
@router.post("/vat/calculate", response_model=VATCalculationResponse)
async def calculate_vat(vat_data: VATCalculationRequest):
    """Calculate Sri Lankan VAT"""
    try:
        subtotal = vat_data.amount
        vat_rate = vat_data.vat_rate
        
        # Calculate VAT amount
        vat_amount = (subtotal * vat_rate) / 100
        total = subtotal + vat_amount
        
        return VATCalculationResponse(
            subtotal=round(subtotal, 2),
            vat_amount=round(vat_amount, 2),
            total=round(total, 2),
            vat_rate=vat_rate
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating VAT: {str(e)}")


@router.get("/vat/rates")
async def get_vat_rates():
    """Get current Sri Lankan VAT rates"""
    return {
        "standard_rate": 18.0,
        "reduced_rates": [
            {"category": "Essential goods", "rate": 0.0},
            {"category": "Pharmaceuticals", "rate": 0.0},
            {"category": "Educational materials", "rate": 0.0}
        ],
        "effective_date": "2024-01-01",
        "currency": "LKR"
    }


# Mobile Payment Providers
@router.get("/mobile-payments/providers", response_model=List[MobilePaymentProvider])
async def get_mobile_payment_providers():
    """Get available mobile payment providers in Sri Lanka"""
    providers = [
        {
            "id": "ez_cash",
            "name": "eZ Cash",
            "name_si": "ඊ-සී කෑෂ්",
            "name_ta": "ஈ-சீ கேஷ்",
            "logo_url": "/images/providers/ez_cash.png",
            "is_active": True,
            "fee_percentage": 1.5,
            "min_amount": 10.0,
            "max_amount": 100000.0
        },
        {
            "id": "mcash",
            "name": "mCash",
            "name_si": "එම්කෑෂ්",
            "name_ta": "எம்கேஷ்",
            "logo_url": "/images/providers/mcash.png",
            "is_active": True,
            "fee_percentage": 1.0,
            "min_amount": 10.0,
            "max_amount": 50000.0
        },
        {
            "id": "payhere",
            "name": "PayHere",
            "name_si": "පේහියර්",
            "name_ta": "பேஹியர்",
            "logo_url": "/images/providers/payhere.png",
            "is_active": True,
            "fee_percentage": 2.0,
            "min_amount": 50.0,
            "max_amount": 500000.0
        },
        {
            "id": "helapay",
            "name": "HELAPay",
            "name_si": "හෙලාපේ",
            "name_ta": "ஹெலாபே",
            "logo_url": "/images/providers/helapay.png",
            "is_active": True,
            "fee_percentage": 1.2,
            "min_amount": 25.0,
            "max_amount": 200000.0
        },
        {
            "id": "lankaqr",
            "name": "LankaQR",
            "name_si": "ලංකා QR",
            "name_ta": "லங்கா QR",
            "logo_url": "/images/providers/lankaqr.png",
            "is_active": True,
            "fee_percentage": 0.5,
            "min_amount": 10.0,
            "max_amount": 1000000.0
        },
        {
            "id": "govpay",
            "name": "GovPay",
            "name_si": "ගව්පේ",
            "name_ta": "கவ்பே",
            "logo_url": "/images/providers/govpay.png",
            "is_active": True,
            "fee_percentage": 0.0,
            "min_amount": 10.0,
            "max_amount": 100000.0
        }
    ]
    
    return providers


# Customer Area/Village Grouping
@router.get("/customers/areas")
async def get_customer_areas(db: Session = Depends(get_db)):
    """Get unique customer areas/villages for collection routes"""
    try:
        areas = db.query(Customer.area_village).distinct().filter(
            Customer.area_village.isnot(None),
            Customer.area_village != ""
        ).all()
        
        area_list = [area[0] for area in areas if area[0]]
        area_list.sort()
        
        return {"areas": area_list}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customer areas: {str(e)}")


@router.get("/customers/by-area/{area}")
async def get_customers_by_area(area: str, db: Session = Depends(get_db)):
    """Get customers in a specific area/village"""
    try:
        customers = db.query(Customer).filter(
            Customer.area_village == area,
            Customer.is_active == True
        ).order_by(Customer.name).all()
        
        return [
            {
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "address": customer.address,
                "current_balance": float(customer.current_balance),
                "credit_limit": float(customer.credit_limit)
            }
            for customer in customers
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customers by area: {str(e)}")


# Festival Greetings and Stock Reminders
@router.get("/notifications/festival-reminders")
async def get_festival_reminders(db: Session = Depends(get_db)):
    """Get festival reminders for stock-up and greetings"""
    try:
        # Get festivals that need notifications today
        festivals = db.query(FestivalCalendar).filter(
            FestivalCalendar.send_stock_reminders == True
        ).all()
        
        reminders = []
        for festival in festivals:
            if festival.should_send_notification():
                reminders.append({
                    "festival_id": festival.id,
                    "festival_name": festival.name,
                    "date": festival.date.isoformat(),
                    "days_until": festival.days_until(),
                    "type": "stock_reminder" if festival.send_stock_reminders else "greeting",
                    "message": festival.business_notes or f"Prepare for {festival.name}",
                    "expected_impact": festival.expected_sales_impact
                })
        
        return {"reminders": reminders}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching festival reminders: {str(e)}")


@router.get("/greetings/festival/{festival_id}")
async def get_festival_greeting(
    festival_id: int,
    language: str = Query("en", description="Language for greeting (en, si, ta)"),
    db: Session = Depends(get_db)
):
    """Get festival greeting message in specified language"""
    try:
        festival = db.query(FestivalCalendar).filter(FestivalCalendar.id == festival_id).first()
        if not festival:
            raise HTTPException(status_code=404, detail="Festival not found")
        
        greeting = festival.get_greeting_message(language)
        
        return {
            "festival_name": festival.get_name(language),
            "greeting_message": greeting,
            "language": language,
            "date": festival.date.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching festival greeting: {str(e)}")