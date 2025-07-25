"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                     Sales API Endpoints                                          ║
║                                                                                                  ║
║  Description: FastAPI endpoints for sales operations and payment processing.                    ║
║                                                                                                  ║
║  Author: Ceybyte Development Team                                                                ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(prefix="/sales", tags=["sales"])

# Pydantic models
class SaleItemCreate(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    discount_amount: float = 0.0
    notes: Optional[str] = None

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    items: List[SaleItemCreate]
    payment_method: str  # cash, card, mobile, credit
    amount_tendered: Optional[float] = None
    payment_reference: Optional[str] = None
    payment_notes: Optional[str] = None
    sale_notes: Optional[str] = None
    is_customer_mode: bool = False

class ProductInfo(BaseModel):
    id: int
    name_en: str
    name_si: Optional[str] = None
    name_ta: Optional[str] = None
    barcode: Optional[str] = None
    unit_of_measure: Optional[dict] = None

class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    product: ProductInfo
    quantity: float
    unit_price: float
    original_price: float
    discount_amount: float
    line_total: float
    notes: Optional[str] = None

class PaymentInfo(BaseModel):
    method: str
    amount_tendered: Optional[float] = None
    change: Optional[float] = None
    reference: Optional[str] = None
    notes: Optional[str] = None

class SaleTotals(BaseModel):
    subtotal: float
    discount: float
    tax: float
    total: float
    item_count: int

class SaleMetadata(BaseModel):
    is_customer_mode: bool
    sale_notes: Optional[str] = None

class SaleResponse(BaseModel):
    id: int
    receipt_number: str
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    user_id: int
    terminal_id: int
    items: List[SaleItemResponse]
    payment: PaymentInfo
    totals: SaleTotals
    metadata: SaleMetadata
    created_at: str
    updated_at: str

# Mock data
mock_sales = []
sale_counter = 1

# Mock product data for sale items
mock_products = {
    1: {
        "id": 1,
        "name_en": "Rice - Basmati",
        "name_si": "බාස්මති සහල්",
        "name_ta": "பாஸ்மதி அரிசி",
        "barcode": "CB000001ABC123",
        "unit_of_measure": {"abbreviation": "kg"}
    },
    2: {
        "id": 2,
        "name_en": "Coca Cola - 330ml",
        "name_si": "කොකා කෝලා - 330ml",
        "name_ta": "கோகா கோலா - 330ml",
        "barcode": "CB000002DEF456",
        "unit_of_measure": {"abbreviation": "pcs"}
    }
}

@router.post("/", response_model=SaleResponse)
async def create_sale(sale: SaleCreate):
    """Create new sale"""
    global sale_counter
    
    # Calculate totals
    subtotal = sum(item.quantity * item.unit_price for item in sale.items)
    total_discount = sum(item.discount_amount for item in sale.items)
    total = subtotal - total_discount
    item_count = sum(item.quantity for item in sale.items)
    
    # Calculate change for cash payments
    change = 0.0
    if sale.payment_method == "cash" and sale.amount_tendered:
        change = max(0, sale.amount_tendered - total)
    
    # Create sale items
    sale_items = []
    for i, item in enumerate(sale.items):
        product = mock_products.get(item.product_id, {
            "id": item.product_id,
            "name_en": f"Product {item.product_id}",
            "barcode": f"MOCK{item.product_id}",
            "unit_of_measure": {"abbreviation": "pcs"}
        })
        
        sale_items.append({
            "id": sale_counter * 100 + i,
            "product_id": item.product_id,
            "product": product,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "original_price": item.unit_price,
            "discount_amount": item.discount_amount,
            "line_total": item.quantity * item.unit_price - item.discount_amount,
            "notes": item.notes
        })
    
    # Create sale record
    new_sale = {
        "id": sale_counter,
        "receipt_number": f"RCP-{sale_counter:06d}",
        "customer_id": sale.customer_id,
        "customer_name": sale.customer_name,
        "user_id": 1,  # Mock user ID
        "terminal_id": 1,  # Mock terminal ID
        "items": sale_items,
        "payment": {
            "method": sale.payment_method,
            "amount_tendered": sale.amount_tendered,
            "change": change,
            "reference": sale.payment_reference,
            "notes": sale.payment_notes
        },
        "totals": {
            "subtotal": subtotal,
            "discount": total_discount,
            "tax": 0.0,  # No tax calculation for now
            "total": total,
            "item_count": item_count
        },
        "metadata": {
            "is_customer_mode": sale.is_customer_mode,
            "sale_notes": sale.sale_notes
        },
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    mock_sales.append(new_sale)
    sale_counter += 1
    
    return new_sale

@router.get("/", response_model=List[SaleResponse])
async def get_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    customer_id: Optional[int] = Query(None),
    payment_method: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    terminal_id: Optional[int] = Query(None)
):
    """Get sales with optional filtering"""
    sales = mock_sales.copy()
    
    # Apply filters
    if customer_id:
        sales = [s for s in sales if s["customer_id"] == customer_id]
    
    if payment_method:
        sales = [s for s in sales if s["payment"]["method"] == payment_method]
    
    if user_id:
        sales = [s for s in sales if s["user_id"] == user_id]
    
    if terminal_id:
        sales = [s for s in sales if s["terminal_id"] == terminal_id]
    
    # Apply pagination
    return sales[skip:skip + limit]

@router.get("/{sale_id}", response_model=SaleResponse)
async def get_sale(sale_id: int):
    """Get single sale by ID"""
    sale = next((s for s in mock_sales if s["id"] == sale_id), None)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.get("/receipt/{receipt_number}", response_model=SaleResponse)
async def get_sale_by_receipt(receipt_number: str):
    """Get sale by receipt number"""
    sale = next((s for s in mock_sales if s["receipt_number"] == receipt_number), None)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

@router.post("/{sale_id}/void")
async def void_sale(sale_id: int, reason: str):
    """Void/cancel sale"""
    sale = next((s for s in mock_sales if s["id"] == sale_id), None)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # In a real implementation, you would mark the sale as voided
    # For now, just return success
    return {"message": f"Sale {sale_id} voided successfully. Reason: {reason}"}

@router.post("/{sale_id}/print")
async def print_receipt(sale_id: int):
    """Print receipt"""
    sale = next((s for s in mock_sales if s["id"] == sale_id), None)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # In a real implementation, this would send to thermal printer
    # For now, just return success
    return {"message": f"Receipt for sale {sale_id} sent to printer"}

@router.get("/summary/daily")
async def get_daily_summary(date: Optional[str] = Query(None)):
    """Get daily sales summary"""
    # Mock daily summary
    summary = {
        "date": date or datetime.now().strftime("%Y-%m-%d"),
        "total_sales": len(mock_sales),
        "total_amount": sum(s["totals"]["total"] for s in mock_sales),
        "payment_methods": {
            "cash": {
                "count": len([s for s in mock_sales if s["payment"]["method"] == "cash"]),
                "amount": sum(s["totals"]["total"] for s in mock_sales if s["payment"]["method"] == "cash")
            },
            "card": {
                "count": len([s for s in mock_sales if s["payment"]["method"] == "card"]),
                "amount": sum(s["totals"]["total"] for s in mock_sales if s["payment"]["method"] == "card")
            },
            "mobile": {
                "count": len([s for s in mock_sales if s["payment"]["method"] == "mobile"]),
                "amount": sum(s["totals"]["total"] for s in mock_sales if s["payment"]["method"] == "mobile")
            },
            "credit": {
                "count": len([s for s in mock_sales if s["payment"]["method"] == "credit"]),
                "amount": sum(s["totals"]["total"] for s in mock_sales if s["payment"]["method"] == "credit")
            }
        },
        "top_products": []
    }
    
    return summary