"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                   Dashboard API Endpoints                                        ║
║                                                                                                  ║
║  Description: FastAPI endpoints for dashboard data including sales analytics,                   ║
║               cash flow tracking, alerts, and business intelligence.                            ║
║                                                                                                  ║
║  Author: Akash Hasendra                                                                          ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Pydantic models for dashboard data
class DashboardStats(BaseModel):
    today_sales: float
    today_costs: float
    today_profit: float
    today_transactions: int
    cash_in_drawer: float
    pending_receivables: float
    pending_payables: float
    low_stock_items: int

class CashFlowEntry(BaseModel):
    timestamp: str
    type: str  # "sale", "payment_received", "payment_made", "expense"
    amount: float
    description: str
    running_balance: float

class AlertItem(BaseModel):
    id: str
    type: str  # "low_stock", "overdue_payment", "system", "cash_drawer"
    severity: str  # "high", "medium", "low"
    title: str
    message: str
    action_required: bool
    created_at: str

class SalesTrend(BaseModel):
    date: str
    sales_amount: float
    transaction_count: int
    profit: float

class PaymentMethodBreakdown(BaseModel):
    method: str
    count: int
    amount: float
    percentage: float

class TopProduct(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: float
    revenue: float
    profit: float

class CashDrawerStatus(BaseModel):
    opening_balance: float
    current_balance: float
    total_cash_sales: float
    total_cash_received: float
    total_cash_paid: float
    last_opened: str
    is_balanced: bool

class MonthlyReport(BaseModel):
    month: str
    total_sales: float
    total_profit: float
    transaction_count: int
    average_sale_value: float
    top_selling_products: List[TopProduct]
    payment_breakdown: List[PaymentMethodBreakdown]

# Mock data generators
def generate_mock_stats() -> DashboardStats:
    """Generate mock dashboard statistics"""
    today_sales = random.uniform(50000, 150000)
    today_costs = today_sales * random.uniform(0.6, 0.8)
    
    return DashboardStats(
        today_sales=today_sales,
        today_costs=today_costs,
        today_profit=today_sales - today_costs,
        today_transactions=random.randint(25, 85),
        cash_in_drawer=random.uniform(15000, 45000),
        pending_receivables=random.uniform(80000, 200000),
        pending_payables=random.uniform(30000, 120000),
        low_stock_items=random.randint(2, 12)
    )

def generate_mock_cash_flow() -> List[CashFlowEntry]:
    """Generate mock cash flow entries for today"""
    entries = []
    running_balance = 25000.0  # Starting balance
    
    # Generate entries for the last 8 hours
    base_time = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
    
    for i in range(15):  # 15 entries throughout the day
        entry_time = base_time + timedelta(minutes=i * 30)
        
        # Random transaction type
        transaction_types = [
            ("sale", "Cash Sale", random.uniform(500, 3000)),
            ("payment_received", "Customer Payment", random.uniform(2000, 8000)),
            ("payment_made", "Supplier Payment", -random.uniform(5000, 15000)),
            ("expense", "Shop Expense", -random.uniform(200, 1500))
        ]
        
        trans_type, description, amount = random.choice(transaction_types)
        running_balance += amount
        
        entries.append(CashFlowEntry(
            timestamp=entry_time.isoformat(),
            type=trans_type,
            amount=amount,
            description=description,
            running_balance=running_balance
        ))
    
    return sorted(entries, key=lambda x: x.timestamp)

def generate_mock_alerts() -> List[AlertItem]:
    """Generate mock alert items"""
    alerts = [
        AlertItem(
            id="alert_001",
            type="low_stock",
            severity="high",
            title="Low Stock Alert",
            message="Rice - Basmati is running low (5 kg remaining)",
            action_required=True,
            created_at=datetime.now().isoformat()
        ),
        AlertItem(
            id="alert_002",
            type="overdue_payment",
            severity="medium",
            title="Overdue Payment",
            message="Customer Kamal Silva has overdue payment of Rs. 12,500",
            action_required=True,
            created_at=(datetime.now() - timedelta(hours=2)).isoformat()
        ),
        AlertItem(
            id="alert_003",
            type="cash_drawer",
            severity="low",
            title="Cash Drawer",
            message="Consider banking excess cash (Rs. 45,000 in drawer)",
            action_required=False,
            created_at=(datetime.now() - timedelta(hours=1)).isoformat()
        )
    ]
    
    return alerts

def generate_mock_sales_trend(days: int = 7) -> List[SalesTrend]:
    """Generate mock sales trend data"""
    trends = []
    base_date = datetime.now() - timedelta(days=days-1)
    
    for i in range(days):
        date = base_date + timedelta(days=i)
        sales_amount = random.uniform(40000, 120000)
        
        trends.append(SalesTrend(
            date=date.strftime("%Y-%m-%d"),
            sales_amount=sales_amount,
            transaction_count=random.randint(20, 80),
            profit=sales_amount * random.uniform(0.15, 0.35)
        ))
    
    return trends

def generate_mock_cash_drawer() -> CashDrawerStatus:
    """Generate mock cash drawer status"""
    opening_balance = 20000.0
    cash_sales = random.uniform(25000, 45000)
    cash_received = random.uniform(5000, 15000)
    cash_paid = random.uniform(2000, 8000)
    
    current_balance = opening_balance + cash_sales + cash_received - cash_paid
    
    return CashDrawerStatus(
        opening_balance=opening_balance,
        current_balance=current_balance,
        total_cash_sales=cash_sales,
        total_cash_received=cash_received,
        total_cash_paid=cash_paid,
        last_opened=datetime.now().replace(hour=8, minute=30).isoformat(),
        is_balanced=abs(current_balance - (opening_balance + cash_sales + cash_received - cash_paid)) < 100
    )

# API Endpoints
@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get main dashboard statistics"""
    return generate_mock_stats()

@router.get("/cash-flow", response_model=List[CashFlowEntry])
async def get_cash_flow(hours: int = Query(8, ge=1, le=24)):
    """Get cash flow entries for specified hours"""
    return generate_mock_cash_flow()

@router.get("/alerts", response_model=List[AlertItem])
async def get_alerts(severity: Optional[str] = Query(None)):
    """Get system alerts"""
    alerts = generate_mock_alerts()
    
    if severity:
        alerts = [a for a in alerts if a.severity == severity]
    
    return alerts

@router.get("/sales-trend", response_model=List[SalesTrend])
async def get_sales_trend(days: int = Query(7, ge=1, le=30)):
    """Get sales trend data"""
    return generate_mock_sales_trend(days)

@router.get("/cash-drawer", response_model=CashDrawerStatus)
async def get_cash_drawer_status():
    """Get cash drawer status"""
    return generate_mock_cash_drawer()

@router.post("/cash-drawer/open")
async def open_cash_drawer(opening_balance: float):
    """Open cash drawer with opening balance"""
    return {
        "message": "Cash drawer opened successfully",
        "opening_balance": opening_balance,
        "opened_at": datetime.now().isoformat()
    }

@router.post("/cash-drawer/close")
async def close_cash_drawer(closing_balance: float):
    """Close cash drawer with closing balance"""
    expected_balance = generate_mock_cash_drawer().current_balance
    variance = closing_balance - expected_balance
    
    return {
        "message": "Cash drawer closed successfully",
        "closing_balance": closing_balance,
        "expected_balance": expected_balance,
        "variance": variance,
        "closed_at": datetime.now().isoformat()
    }

@router.get("/monthly-report", response_model=MonthlyReport)
async def get_monthly_report(month: Optional[str] = Query(None)):
    """Get monthly business report"""
    target_month = month or datetime.now().strftime("%Y-%m")
    
    # Mock top products
    top_products = [
        TopProduct(
            product_id=1,
            product_name="Rice - Basmati",
            quantity_sold=125.5,
            revenue=37650.0,
            profit=7530.0
        ),
        TopProduct(
            product_id=2,
            product_name="Coca Cola - 330ml",
            quantity_sold=240.0,
            revenue=24000.0,
            profit=4800.0
        )
    ]
    
    # Mock payment breakdown
    payment_breakdown = [
        PaymentMethodBreakdown(method="cash", count=180, amount=450000.0, percentage=65.0),
        PaymentMethodBreakdown(method="card", count=85, amount=170000.0, percentage=25.0),
        PaymentMethodBreakdown(method="mobile", count=45, amount=54000.0, percentage=8.0),
        PaymentMethodBreakdown(method="credit", count=12, amount=18000.0, percentage=2.0)
    ]
    
    total_sales = sum(p.amount for p in payment_breakdown)
    total_profit = total_sales * 0.22  # 22% profit margin
    transaction_count = sum(p.count for p in payment_breakdown)
    
    return MonthlyReport(
        month=target_month,
        total_sales=total_sales,
        total_profit=total_profit,
        transaction_count=transaction_count,
        average_sale_value=total_sales / transaction_count if transaction_count > 0 else 0,
        top_selling_products=top_products,
        payment_breakdown=payment_breakdown
    )

@router.post("/export/excel")
async def export_dashboard_excel(
    report_type: str = Query(..., regex="^(daily|monthly|custom)$"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None)
):
    """Export dashboard data to Excel"""
    # In a real implementation, this would generate an Excel file
    return {
        "message": f"Excel export initiated for {report_type} report",
        "report_type": report_type,
        "start_date": start_date,
        "end_date": end_date,
        "download_url": f"/downloads/dashboard_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    }