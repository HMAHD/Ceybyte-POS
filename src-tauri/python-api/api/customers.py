"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                   Customer API Endpoints                                         ║
║                                                                                                  ║
║  Description: FastAPI endpoints for customer management including credit operations.             ║
║                                                                                                  ║
║  Author: Ceybyte Development Team                                                                ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/customers", tags=["customers"])

# Pydantic models
class CustomerCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    area_village: str
    credit_limit: float = 0.0
    payment_terms_days: int = 30
    whatsapp_opt_in: bool = False
    preferred_language: str = "en"

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    area_village: Optional[str] = None
    credit_limit: Optional[float] = None
    payment_terms_days: Optional[int] = None
    whatsapp_opt_in: Optional[bool] = None
    preferred_language: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str]
    address: Optional[str]
    area_village: str
    credit_limit: float
    current_balance: float
    payment_terms_days: int
    whatsapp_opt_in: bool
    preferred_language: str
    last_payment_date: Optional[str]
    days_overdue: int
    is_active: bool
    created_at: str
    updated_at: str

class CustomerCreditInfo(BaseModel):
    customer_id: int
    credit_limit: float
    current_balance: float
    available_credit: float
    days_overdue: int
    last_payment_date: Optional[str]
    payment_terms_days: int

# Mock data for development
mock_customers = [
    {
        "id": 1,
        "name": "Kamal Perera",
        "phone": "0771234567",
        "email": "kamal@example.com",
        "address": "123 Main Street, Colombo 03",
        "area_village": "Colombo",
        "credit_limit": 50000.00,
        "current_balance": 15000.00,
        "payment_terms_days": 30,
        "whatsapp_opt_in": True,
        "preferred_language": "en",
        "last_payment_date": "2025-01-20",
        "days_overdue": 5,
        "is_active": True,
        "created_at": "2025-01-01T00:00:00",
        "updated_at": "2025-01-20T10:30:00"
    },
    {
        "id": 2,
        "name": "Nimal Silva",
        "phone": "0779876543",
        "email": None,
        "address": "456 Temple Road, Kandy",
        "area_village": "Kandy",
        "credit_limit": 25000.00,
        "current_balance": 8500.00,
        "payment_terms_days": 15,
        "whatsapp_opt_in": False,
        "preferred_language": "si",
        "last_payment_date": "2025-01-15",
        "days_overdue": 0,
        "is_active": True,
        "created_at": "2025-01-05T00:00:00",
        "updated_at": "2025-01-15T14:20:00"
    },
    {
        "id": 3,
        "name": "Priya Rajendran",
        "phone": "0763456789",
        "email": "priya@email.com",
        "address": "789 Hill Street, Jaffna",
        "area_village": "Jaffna",
        "credit_limit": 30000.00,
        "current_balance": 0.00,
        "payment_terms_days": 20,
        "whatsapp_opt_in": True,
        "preferred_language": "ta",
        "last_payment_date": "2025-01-18",
        "days_overdue": 0,
        "is_active": True,
        "created_at": "2025-01-10T00:00:00",
        "updated_at": "2025-01-18T16:45:00"
    }
]

@router.get("/", response_model=List[CustomerResponse])
async def get_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    area_village: Optional[str] = Query(None),
    has_credit: Optional[bool] = Query(None),
    overdue_only: Optional[bool] = Query(None),
    active_only: Optional[bool] = Query(True)
):
    """Get customers with optional filtering"""
    customers = mock_customers.copy()
    
    # Apply filters
    if active_only:
        customers = [c for c in customers if c["is_active"]]
    
    if search:
        customers = [c for c in customers if 
                    search.lower() in c["name"].lower() or 
                    search in c["phone"]]
    
    if area_village:
        customers = [c for c in customers if c["area_village"] == area_village]
    
    if has_credit is not None:
        if has_credit:
            customers = [c for c in customers if c["current_balance"] > 0]
        else:
            customers = [c for c in customers if c["current_balance"] == 0]
    
    if overdue_only:
        customers = [c for c in customers if c["days_overdue"] > 0]
    
    # Apply pagination
    return customers[skip:skip + limit]

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int):
    """Get single customer by ID"""
    customer = next((c for c in mock_customers if c["id"] == customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=CustomerResponse)
async def create_customer(customer: CustomerCreate):
    """Create new customer"""
    new_id = max([c["id"] for c in mock_customers]) + 1
    new_customer = {
        "id": new_id,
        **customer.dict(),
        "current_balance": 0.0,
        "last_payment_date": None,
        "days_overdue": 0,
        "is_active": True,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    mock_customers.append(new_customer)
    return new_customer

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: int, customer_update: CustomerUpdate):
    """Update customer"""
    customer = next((c for c in mock_customers if c["id"] == customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update fields
    for field, value in customer_update.dict(exclude_unset=True).items():
        customer[field] = value
    
    customer["updated_at"] = datetime.now().isoformat()
    return customer

@router.delete("/{customer_id}")
async def delete_customer(customer_id: int):
    """Soft delete customer"""
    customer = next((c for c in mock_customers if c["id"] == customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer["is_active"] = False
    customer["updated_at"] = datetime.now().isoformat()
    return {"message": "Customer deleted successfully"}

@router.get("/{customer_id}/credit", response_model=CustomerCreditInfo)
async def get_customer_credit(customer_id: int):
    """Get customer credit information"""
    customer = next((c for c in mock_customers if c["id"] == customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {
        "customer_id": customer["id"],
        "credit_limit": customer["credit_limit"],
        "current_balance": customer["current_balance"],
        "available_credit": customer["credit_limit"] - customer["current_balance"],
        "days_overdue": customer["days_overdue"],
        "last_payment_date": customer["last_payment_date"],
        "payment_terms_days": customer["payment_terms_days"]
    }

@router.post("/{customer_id}/credit/check")
async def check_credit_limit(customer_id: int, amount: float):
    """Check if customer can make credit purchase"""
    customer = next((c for c in mock_customers if c["id"] == customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    available_credit = customer["credit_limit"] - customer["current_balance"]
    can_purchase = amount <= available_credit
    would_exceed_by = None if can_purchase else amount - available_credit
    
    return {
        "can_purchase": can_purchase,
        "available_credit": available_credit,
        "would_exceed_by": would_exceed_by,
        "requires_approval": not can_purchase and would_exceed_by < 10000
    }

@router.get("/search")
async def search_customers(q: str = Query(..., min_length=1)):
    """Search customers by name or phone"""
    customers = [c for c in mock_customers if 
                q.lower() in c["name"].lower() or 
                q in c["phone"]]
    return customers

@router.get("/area/{area_village}")
async def get_customers_by_area(area_village: str):
    """Get customers by area/village"""
    customers = [c for c in mock_customers if c["area_village"] == area_village]
    return customers

@router.get("/overdue")
async def get_overdue_customers():
    """Get customers with overdue payments"""
    overdue_customers = []
    for customer in mock_customers:
        if customer["days_overdue"] > 0:
            overdue_customers.append({
                **customer,
                "overdue_amount": customer["current_balance"]
            })
    return overdue_customers