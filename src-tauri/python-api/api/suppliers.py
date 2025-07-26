"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   Supplier API Endpoints                                         │
│                                                                                                  │
│  Description: FastAPI endpoints for supplier management including credit operations,             │
│               invoice entry, goods received tracking, and payment processing.                    │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date
import os
import uuid

from database.connection import get_db
from models.supplier import Supplier
from models.supplier_invoice import SupplierInvoice
from models.supplier_payment import SupplierPayment

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

# Pydantic models
class SupplierCreate(BaseModel):
    name: str
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    business_registration: Optional[str] = None
    vat_number: Optional[str] = None
    credit_limit: float = 0.0
    payment_terms_days: int = 30
    visit_day: Optional[str] = None
    visit_frequency: str = "weekly"
    notes: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    business_registration: Optional[str] = None
    vat_number: Optional[str] = None
    credit_limit: Optional[float] = None
    payment_terms_days: Optional[int] = None
    visit_day: Optional[str] = None
    visit_frequency: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class SupplierResponse(BaseModel):
    id: int
    name: str
    company_name: Optional[str]
    contact_person: Optional[str]
    phone: Optional[str]
    mobile: Optional[str]
    email: Optional[str]
    address_line1: Optional[str]
    address_line2: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    business_registration: Optional[str]
    vat_number: Optional[str]
    credit_limit: float
    current_balance: float
    payment_terms_days: int
    visit_day: Optional[str]
    visit_frequency: str
    last_visit_date: Optional[str]
    next_visit_date: Optional[str]
    is_active: bool
    notes: Optional[str]
    created_at: str
    updated_at: str

class SupplierInvoiceCreate(BaseModel):
    supplier_id: int
    supplier_invoice_number: str
    invoice_date: str
    due_date: str
    subtotal: float
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    total_amount: float
    po_number: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    payment_terms: Optional[str] = None

class SupplierInvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    supplier_invoice_number: str
    supplier_id: int
    supplier_name: str
    invoice_date: str
    due_date: str
    subtotal: float
    discount_amount: float
    tax_amount: float
    total_amount: float
    paid_amount: float
    balance_amount: float
    status: str
    payment_status: str
    goods_received: bool
    po_number: Optional[str]
    description: Optional[str]
    notes: Optional[str]
    invoice_photo_path: Optional[str]
    created_at: str
    updated_at: str

class SupplierPaymentCreate(BaseModel):
    supplier_id: int
    invoice_id: Optional[int] = None
    payment_method: str
    amount: float
    payment_date: Optional[str] = None
    cheque_number: Optional[str] = None
    cheque_date: Optional[str] = None
    bank_name: Optional[str] = None
    transfer_reference: Optional[str] = None
    account_number: Optional[str] = None
    mobile_number: Optional[str] = None
    transaction_id: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

class SupplierPaymentResponse(BaseModel):
    id: int
    payment_number: str
    supplier_id: int
    supplier_name: str
    invoice_id: Optional[int]
    invoice_number: Optional[str]
    payment_method: str
    amount: float
    payment_date: str
    status: str
    allocated_amount: float
    advance_amount: float
    description: Optional[str]
    notes: Optional[str]
    created_at: str
    updated_at: str

# Helper functions
def generate_invoice_number(db: Session) -> str:
    """Generate next invoice number"""
    last_invoice = db.query(SupplierInvoice).order_by(SupplierInvoice.id.desc()).first()
    if last_invoice:
        last_num = int(last_invoice.invoice_number.split('-')[-1])
        return f"INV-2025-{last_num + 1:03d}"
    return "INV-2025-001"

def generate_payment_number(db: Session) -> str:
    """Generate next payment number"""
    last_payment = db.query(SupplierPayment).order_by(SupplierPayment.id.desc()).first()
    if last_payment:
        last_num = int(last_payment.payment_number.split('-')[-1])
        return f"PAY-2025-{last_num + 1:03d}"
    return "PAY-2025-001"

@router.get("/", response_model=List[SupplierResponse])
async def get_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    has_balance: Optional[bool] = Query(None),
    visit_due: Optional[bool] = Query(None),
    active_only: Optional[bool] = Query(True),
    db: Session = Depends(get_db)
):
    """Get suppliers with optional filtering"""
    query = db.query(Supplier)
    
    # Apply filters
    if active_only:
        query = query.filter(Supplier.is_active == True)
    
    if search:
        search_filter = or_(
            Supplier.name.ilike(f"%{search}%"),
            Supplier.company_name.ilike(f"%{search}%"),
            Supplier.contact_person.ilike(f"%{search}%"),
            Supplier.phone.ilike(f"%{search}%"),
            Supplier.mobile.ilike(f"%{search}%"),
            Supplier.email.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if city:
        query = query.filter(Supplier.city == city)
    
    if has_balance is not None:
        if has_balance:
            query = query.filter(Supplier.current_balance > 0)
        else:
            query = query.filter(Supplier.current_balance == 0)
    
    if visit_due:
        today = date.today()
        query = query.filter(
            and_(
                Supplier.next_visit_date.isnot(None),
                Supplier.next_visit_date <= today
            )
        )
    
    # Apply pagination and get results
    suppliers = query.offset(skip).limit(limit).all()
    
    # Convert to response format
    return [
        SupplierResponse(
            id=supplier.id,
            name=supplier.name,
            company_name=supplier.company_name,
            contact_person=supplier.contact_person,
            phone=supplier.phone,
            mobile=supplier.mobile,
            email=supplier.email,
            address_line1=supplier.address_line1,
            address_line2=supplier.address_line2,
            city=supplier.city,
            postal_code=supplier.postal_code,
            business_registration=supplier.business_registration,
            vat_number=supplier.vat_number,
            credit_limit=float(supplier.credit_limit),
            current_balance=float(supplier.current_balance),
            payment_terms_days=supplier.payment_terms_days,
            visit_day=supplier.visit_day,
            visit_frequency=supplier.visit_frequency,
            last_visit_date=supplier.last_visit_date.isoformat() if supplier.last_visit_date else None,
            next_visit_date=supplier.next_visit_date.isoformat() if supplier.next_visit_date else None,
            is_active=supplier.is_active,
            notes=supplier.notes,
            created_at=supplier.created_at.isoformat(),
            updated_at=supplier.updated_at.isoformat()
        )
        for supplier in suppliers
    ]

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Get single supplier by ID"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return SupplierResponse(
        id=supplier.id,
        name=supplier.name,
        company_name=supplier.company_name,
        contact_person=supplier.contact_person,
        phone=supplier.phone,
        mobile=supplier.mobile,
        email=supplier.email,
        address_line1=supplier.address_line1,
        address_line2=supplier.address_line2,
        city=supplier.city,
        postal_code=supplier.postal_code,
        business_registration=supplier.business_registration,
        vat_number=supplier.vat_number,
        credit_limit=float(supplier.credit_limit),
        current_balance=float(supplier.current_balance),
        payment_terms_days=supplier.payment_terms_days,
        visit_day=supplier.visit_day,
        visit_frequency=supplier.visit_frequency,
        last_visit_date=supplier.last_visit_date.isoformat() if supplier.last_visit_date else None,
        next_visit_date=supplier.next_visit_date.isoformat() if supplier.next_visit_date else None,
        is_active=supplier.is_active,
        notes=supplier.notes,
        created_at=supplier.created_at.isoformat(),
        updated_at=supplier.updated_at.isoformat()
    )

@router.post("/", response_model=SupplierResponse)
async def create_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):
    """Create new supplier"""
    try:
        db_supplier = Supplier(
            name=supplier.name,
            company_name=supplier.company_name,
            contact_person=supplier.contact_person,
            phone=supplier.phone,
            mobile=supplier.mobile,
            email=supplier.email,
            address_line1=supplier.address_line1,
            address_line2=supplier.address_line2,
            city=supplier.city,
            postal_code=supplier.postal_code,
            business_registration=supplier.business_registration,
            vat_number=supplier.vat_number,
            credit_limit=supplier.credit_limit,
            payment_terms_days=supplier.payment_terms_days,
            visit_day=supplier.visit_day,
            visit_frequency=supplier.visit_frequency,
            notes=supplier.notes,
            current_balance=0.0,
            is_active=True
        )
        
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        
        return SupplierResponse(
            id=db_supplier.id,
            name=db_supplier.name,
            company_name=db_supplier.company_name,
            contact_person=db_supplier.contact_person,
            phone=db_supplier.phone,
            mobile=db_supplier.mobile,
            email=db_supplier.email,
            address_line1=db_supplier.address_line1,
            address_line2=db_supplier.address_line2,
            city=db_supplier.city,
            postal_code=db_supplier.postal_code,
            business_registration=db_supplier.business_registration,
            vat_number=db_supplier.vat_number,
            credit_limit=float(db_supplier.credit_limit),
            current_balance=float(db_supplier.current_balance),
            payment_terms_days=db_supplier.payment_terms_days,
            visit_day=db_supplier.visit_day,
            visit_frequency=db_supplier.visit_frequency,
            last_visit_date=db_supplier.last_visit_date.isoformat() if db_supplier.last_visit_date else None,
            next_visit_date=db_supplier.next_visit_date.isoformat() if db_supplier.next_visit_date else None,
            is_active=db_supplier.is_active,
            notes=db_supplier.notes,
            created_at=db_supplier.created_at.isoformat(),
            updated_at=db_supplier.updated_at.isoformat()
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating supplier: {str(e)}")

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(supplier_id: int, supplier_update: SupplierUpdate, db: Session = Depends(get_db)):
    """Update supplier"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    try:
        # Update fields
        update_data = supplier_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(supplier, field, value)
        
        db.commit()
        db.refresh(supplier)
        
        return SupplierResponse(
            id=supplier.id,
            name=supplier.name,
            company_name=supplier.company_name,
            contact_person=supplier.contact_person,
            phone=supplier.phone,
            mobile=supplier.mobile,
            email=supplier.email,
            address_line1=supplier.address_line1,
            address_line2=supplier.address_line2,
            city=supplier.city,
            postal_code=supplier.postal_code,
            business_registration=supplier.business_registration,
            vat_number=supplier.vat_number,
            credit_limit=float(supplier.credit_limit),
            current_balance=float(supplier.current_balance),
            payment_terms_days=supplier.payment_terms_days,
            visit_day=supplier.visit_day,
            visit_frequency=supplier.visit_frequency,
            last_visit_date=supplier.last_visit_date.isoformat() if supplier.last_visit_date else None,
            next_visit_date=supplier.next_visit_date.isoformat() if supplier.next_visit_date else None,
            is_active=supplier.is_active,
            notes=supplier.notes,
            created_at=supplier.created_at.isoformat(),
            updated_at=supplier.updated_at.isoformat()
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error updating supplier: {str(e)}")

@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Soft delete supplier"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    try:
        supplier.is_active = False
        db.commit()
        return {"message": "Supplier deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting supplier: {str(e)}")

# Invoice endpoints
@router.get("/{supplier_id}/invoices", response_model=List[SupplierInvoiceResponse])
async def get_supplier_invoices(
    supplier_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get supplier invoices"""
    # Verify supplier exists
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    query = db.query(SupplierInvoice).filter(SupplierInvoice.supplier_id == supplier_id)
    
    if status:
        query = query.filter(SupplierInvoice.status == status)
    
    if payment_status:
        query = query.filter(SupplierInvoice.payment_status == payment_status)
    
    invoices = query.offset(skip).limit(limit).all()
    
    return [
        SupplierInvoiceResponse(
            id=invoice.id,
            invoice_number=invoice.invoice_number,
            supplier_invoice_number=invoice.supplier_invoice_number,
            supplier_id=invoice.supplier_id,
            supplier_name=invoice.supplier.name,
            invoice_date=invoice.invoice_date.isoformat(),
            due_date=invoice.due_date.isoformat(),
            subtotal=float(invoice.subtotal),
            discount_amount=float(invoice.discount_amount),
            tax_amount=float(invoice.tax_amount),
            total_amount=float(invoice.total_amount),
            paid_amount=float(invoice.paid_amount),
            balance_amount=float(invoice.balance_amount),
            status=invoice.status,
            payment_status=invoice.payment_status,
            goods_received=invoice.goods_received,
            po_number=invoice.po_number,
            description=invoice.description,
            notes=invoice.notes,
            invoice_photo_path=invoice.invoice_photo_path,
            created_at=invoice.created_at.isoformat(),
            updated_at=invoice.updated_at.isoformat()
        )
        for invoice in invoices
    ]

@router.post("/{supplier_id}/invoices", response_model=SupplierInvoiceResponse)
async def create_supplier_invoice(supplier_id: int, invoice: SupplierInvoiceCreate, db: Session = Depends(get_db)):
    """Create new supplier invoice"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    try:
        invoice_number = generate_invoice_number(db)
        
        db_invoice = SupplierInvoice(
            invoice_number=invoice_number,
            supplier_invoice_number=invoice.supplier_invoice_number,
            supplier_id=supplier_id,
            user_id=1,  # TODO: Get from auth context
            invoice_date=datetime.strptime(invoice.invoice_date, "%Y-%m-%d").date(),
            due_date=datetime.strptime(invoice.due_date, "%Y-%m-%d").date(),
            subtotal=invoice.subtotal,
            discount_amount=invoice.discount_amount,
            tax_amount=invoice.tax_amount,
            total_amount=invoice.total_amount,
            paid_amount=0.0,
            balance_amount=invoice.total_amount,
            status="pending",
            payment_status="unpaid",
            goods_received=False,
            po_number=invoice.po_number,
            description=invoice.description,
            notes=invoice.notes,
            payment_terms=invoice.payment_terms
        )
        
        db.add(db_invoice)
        
        # Update supplier balance
        supplier.current_balance += invoice.total_amount
        
        db.commit()
        db.refresh(db_invoice)
        
        return SupplierInvoiceResponse(
            id=db_invoice.id,
            invoice_number=db_invoice.invoice_number,
            supplier_invoice_number=db_invoice.supplier_invoice_number,
            supplier_id=db_invoice.supplier_id,
            supplier_name=supplier.name,
            invoice_date=db_invoice.invoice_date.isoformat(),
            due_date=db_invoice.due_date.isoformat(),
            subtotal=float(db_invoice.subtotal),
            discount_amount=float(db_invoice.discount_amount),
            tax_amount=float(db_invoice.tax_amount),
            total_amount=float(db_invoice.total_amount),
            paid_amount=float(db_invoice.paid_amount),
            balance_amount=float(db_invoice.balance_amount),
            status=db_invoice.status,
            payment_status=db_invoice.payment_status,
            goods_received=db_invoice.goods_received,
            po_number=db_invoice.po_number,
            description=db_invoice.description,
            notes=db_invoice.notes,
            invoice_photo_path=db_invoice.invoice_photo_path,
            created_at=db_invoice.created_at.isoformat(),
            updated_at=db_invoice.updated_at.isoformat()
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating invoice: {str(e)}")

@router.post("/{supplier_id}/invoices/{invoice_id}/upload-photo")
async def upload_invoice_photo(supplier_id: int, invoice_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload invoice photo attachment"""
    invoice = db.query(SupplierInvoice).filter(
        and_(
            SupplierInvoice.id == invoice_id,
            SupplierInvoice.supplier_id == supplier_id
        )
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = "uploads/invoices"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Update invoice
        invoice.invoice_photo_path = file_path
        db.commit()
        
        return {"message": "Photo uploaded successfully", "file_path": file_path}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error uploading photo: {str(e)}")

@router.post("/{supplier_id}/invoices/{invoice_id}/receive-goods")
async def receive_goods(supplier_id: int, invoice_id: int, db: Session = Depends(get_db)):
    """Mark goods as received for invoice"""
    invoice = db.query(SupplierInvoice).filter(
        and_(
            SupplierInvoice.id == invoice_id,
            SupplierInvoice.supplier_id == supplier_id
        )
    ).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    if invoice.goods_received:
        raise HTTPException(status_code=400, detail="Goods already marked as received")
    
    try:
        invoice.goods_received = True
        invoice.status = "received"
        invoice.received_date = date.today()
        
        db.commit()
        
        return {"message": "Goods marked as received successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error marking goods as received: {str(e)}")

# Payment endpoints
@router.get("/{supplier_id}/payments", response_model=List[SupplierPaymentResponse])
async def get_supplier_payments(
    supplier_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get supplier payments"""
    # Verify supplier exists
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    payments = db.query(SupplierPayment).filter(
        SupplierPayment.supplier_id == supplier_id
    ).offset(skip).limit(limit).all()
    
    return [
        SupplierPaymentResponse(
            id=payment.id,
            payment_number=payment.payment_number,
            supplier_id=payment.supplier_id,
            supplier_name=payment.supplier.name,
            invoice_id=payment.invoice_id,
            invoice_number=payment.invoice.invoice_number if payment.invoice else None,
            payment_method=payment.payment_method,
            amount=float(payment.amount),
            payment_date=payment.payment_date.isoformat(),
            status=payment.status,
            allocated_amount=float(payment.allocated_amount),
            advance_amount=float(payment.advance_amount),
            description=payment.description,
            notes=payment.notes,
            created_at=payment.created_at.isoformat(),
            updated_at=payment.updated_at.isoformat()
        )
        for payment in payments
    ]

@router.post("/{supplier_id}/payments", response_model=SupplierPaymentResponse)
async def create_supplier_payment(supplier_id: int, payment: SupplierPaymentCreate, db: Session = Depends(get_db)):
    """Create new supplier payment"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    try:
        payment_number = generate_payment_number(db)
        payment_date = datetime.strptime(payment.payment_date, "%Y-%m-%d") if payment.payment_date else datetime.now()
        
        db_payment = SupplierPayment(
            payment_number=payment_number,
            supplier_id=supplier_id,
            invoice_id=payment.invoice_id,
            user_id=1,  # TODO: Get from auth context
            payment_method=payment.payment_method,
            amount=payment.amount,
            payment_date=payment_date,
            status="completed",
            cheque_number=payment.cheque_number,
            cheque_date=datetime.strptime(payment.cheque_date, "%Y-%m-%d").date() if payment.cheque_date else None,
            bank_name=payment.bank_name,
            transfer_reference=payment.transfer_reference,
            account_number=payment.account_number,
            mobile_number=payment.mobile_number,
            transaction_id=payment.transaction_id,
            description=payment.description,
            notes=payment.notes
        )
        
        # Calculate allocation
        if payment.invoice_id:
            invoice = db.query(SupplierInvoice).filter(SupplierInvoice.id == payment.invoice_id).first()
            if not invoice:
                raise HTTPException(status_code=404, detail="Invoice not found")
            
            # Allocate to specific invoice
            db_payment.allocated_amount = payment.amount
            db_payment.advance_amount = 0.0
            
            # Update invoice payment
            invoice.paid_amount += payment.amount
            invoice.calculate_balance()
            
        else:
            # Advance payment
            db_payment.allocated_amount = 0.0
            db_payment.advance_amount = payment.amount
        
        db.add(db_payment)
        
        # Update supplier balance
        supplier.current_balance = max(0, float(supplier.current_balance) - payment.amount)
        
        db.commit()
        db.refresh(db_payment)
        
        return SupplierPaymentResponse(
            id=db_payment.id,
            payment_number=db_payment.payment_number,
            supplier_id=db_payment.supplier_id,
            supplier_name=supplier.name,
            invoice_id=db_payment.invoice_id,
            invoice_number=db_payment.invoice.invoice_number if db_payment.invoice else None,
            payment_method=db_payment.payment_method,
            amount=float(db_payment.amount),
            payment_date=db_payment.payment_date.isoformat(),
            status=db_payment.status,
            allocated_amount=float(db_payment.allocated_amount),
            advance_amount=float(db_payment.advance_amount),
            description=db_payment.description,
            notes=db_payment.notes,
            created_at=db_payment.created_at.isoformat(),
            updated_at=db_payment.updated_at.isoformat()
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating payment: {str(e)}")

@router.get("/visit-alerts")
async def get_visit_alerts(db: Session = Depends(get_db)):
    """Get suppliers with visits due"""
    today = date.today()
    
    suppliers = db.query(Supplier).filter(
        and_(
            Supplier.is_active == True,
            Supplier.next_visit_date.isnot(None),
            Supplier.next_visit_date <= today
        )
    ).all()
    
    alerts = []
    for supplier in suppliers:
        days_overdue = (today - supplier.next_visit_date).days
        alerts.append({
            "supplier_id": supplier.id,
            "supplier_name": supplier.name,
            "contact_person": supplier.contact_person,
            "phone": supplier.mobile or supplier.phone,
            "next_visit_date": supplier.next_visit_date.isoformat(),
            "days_overdue": days_overdue,
            "visit_frequency": supplier.visit_frequency
        })
    
    return alerts

@router.get("/payment-reminders")
async def get_payment_reminders(db: Session = Depends(get_db)):
    """Get overdue payment reminders"""
    today = date.today()
    
    overdue_invoices = db.query(SupplierInvoice).join(Supplier).filter(
        and_(
            SupplierInvoice.payment_status != "paid",
            SupplierInvoice.due_date < today,
            Supplier.is_active == True
        )
    ).all()
    
    reminders = []
    for invoice in overdue_invoices:
        days_overdue = (today - invoice.due_date).days
        reminders.append({
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "supplier_id": invoice.supplier_id,
            "supplier_name": invoice.supplier.name,
            "contact_person": invoice.supplier.contact_person,
            "phone": invoice.supplier.mobile or invoice.supplier.phone,
            "due_date": invoice.due_date.isoformat(),
            "days_overdue": days_overdue,
            "balance_amount": float(invoice.balance_amount),
            "payment_terms_days": invoice.supplier.payment_terms_days
        })
    
    return reminders

@router.get("/reports/summary")
async def get_supplier_summary(db: Session = Depends(get_db)):
    """Get supplier summary statistics"""
    # Get active suppliers
    active_suppliers = db.query(Supplier).filter(Supplier.is_active == True).all()
    total_suppliers = len(active_suppliers)
    total_balance = sum(float(s.current_balance) for s in active_suppliers)
    
    # Get overdue invoices
    today = date.today()
    overdue_invoices = db.query(SupplierInvoice).join(Supplier).filter(
        and_(
            SupplierInvoice.payment_status != "paid",
            SupplierInvoice.due_date < today,
            Supplier.is_active == True
        )
    ).all()
    
    overdue_amount = sum(float(inv.balance_amount) for inv in overdue_invoices)
    
    # Calculate average payment terms
    avg_payment_terms = sum(s.payment_terms_days for s in active_suppliers) / max(total_suppliers, 1)
    
    return {
        "total_suppliers": total_suppliers,
        "total_outstanding": total_balance,
        "overdue_invoices": len(overdue_invoices),
        "overdue_amount": overdue_amount,
        "average_payment_terms": avg_payment_terms
    }

@router.get("/reports/analytics")
async def get_supplier_analytics(
    days: int = Query(30, description="Number of days for analytics"),
    db: Session = Depends(get_db)
):
    """Get comprehensive supplier analytics"""
    from datetime import timedelta
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # Payment trends
    payments = db.query(SupplierPayment).filter(
        SupplierPayment.payment_date >= start_date
    ).all()
    
    payment_by_method = {}
    total_payments = 0
    for payment in payments:
        method = payment.payment_method
        amount = float(payment.amount)
        payment_by_method[method] = payment_by_method.get(method, 0) + amount
        total_payments += amount
    
    # Invoice trends
    invoices = db.query(SupplierInvoice).filter(
        SupplierInvoice.invoice_date >= start_date
    ).all()
    
    total_invoices = len(invoices)
    total_invoice_amount = sum(float(inv.total_amount) for inv in invoices)
    
    # Top suppliers by transaction volume
    supplier_volumes = {}
    for invoice in invoices:
        supplier_id = invoice.supplier_id
        supplier_name = invoice.supplier.name
        amount = float(invoice.total_amount)
        
        if supplier_id not in supplier_volumes:
            supplier_volumes[supplier_id] = {
                "supplier_id": supplier_id,
                "supplier_name": supplier_name,
                "total_amount": 0,
                "invoice_count": 0
            }
        
        supplier_volumes[supplier_id]["total_amount"] += amount
        supplier_volumes[supplier_id]["invoice_count"] += 1
    
    top_suppliers = sorted(
        supplier_volumes.values(),
        key=lambda x: x["total_amount"],
        reverse=True
    )[:10]
    
    # Payment performance
    paid_invoices = [inv for inv in invoices if inv.payment_status == "paid"]
    avg_payment_days = 0
    if paid_invoices:
        payment_days = []
        for inv in paid_invoices:
            if inv.due_date:
                # Find the last payment for this invoice
                last_payment = db.query(SupplierPayment).filter(
                    SupplierPayment.invoice_id == inv.id
                ).order_by(SupplierPayment.payment_date.desc()).first()
                
                if last_payment:
                    days_to_pay = (last_payment.payment_date.date() - inv.due_date).days
                    payment_days.append(days_to_pay)
        
        if payment_days:
            avg_payment_days = sum(payment_days) / len(payment_days)
    
    # Monthly trends
    monthly_data = {}
    for invoice in invoices:
        month_key = invoice.invoice_date.strftime("%Y-%m")
        if month_key not in monthly_data:
            monthly_data[month_key] = {
                "month": month_key,
                "invoice_count": 0,
                "total_amount": 0,
                "payment_count": 0,
                "payment_amount": 0
            }
        
        monthly_data[month_key]["invoice_count"] += 1
        monthly_data[month_key]["total_amount"] += float(invoice.total_amount)
    
    for payment in payments:
        month_key = payment.payment_date.strftime("%Y-%m")
        if month_key in monthly_data:
            monthly_data[month_key]["payment_count"] += 1
            monthly_data[month_key]["payment_amount"] += float(payment.amount)
    
    monthly_trends = sorted(monthly_data.values(), key=lambda x: x["month"])
    
    return {
        "period_days": days,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "payment_summary": {
            "total_payments": total_payments,
            "payment_count": len(payments),
            "by_method": payment_by_method,
            "average_payment_days": avg_payment_days
        },
        "invoice_summary": {
            "total_invoices": total_invoices,
            "total_amount": total_invoice_amount,
            "average_invoice_amount": total_invoice_amount / max(total_invoices, 1)
        },
        "top_suppliers": top_suppliers,
        "monthly_trends": monthly_trends
    }

@router.get("/reports/aging")
async def get_supplier_aging_report(db: Session = Depends(get_db)):
    """Get supplier aging report"""
    today = date.today()
    
    # Get all unpaid invoices
    unpaid_invoices = db.query(SupplierInvoice).join(Supplier).filter(
        and_(
            SupplierInvoice.payment_status != "paid",
            Supplier.is_active == True
        )
    ).all()
    
    aging_buckets = {
        "current": {"amount": 0, "count": 0, "invoices": []},
        "1_30_days": {"amount": 0, "count": 0, "invoices": []},
        "31_60_days": {"amount": 0, "count": 0, "invoices": []},
        "61_90_days": {"amount": 0, "count": 0, "invoices": []},
        "over_90_days": {"amount": 0, "count": 0, "invoices": []}
    }
    
    for invoice in unpaid_invoices:
        days_overdue = (today - invoice.due_date).days
        amount = float(invoice.balance_amount)
        
        invoice_data = {
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "supplier_name": invoice.supplier.name,
            "due_date": invoice.due_date.isoformat(),
            "days_overdue": days_overdue,
            "balance_amount": amount
        }
        
        if days_overdue <= 0:
            bucket = "current"
        elif days_overdue <= 30:
            bucket = "1_30_days"
        elif days_overdue <= 60:
            bucket = "31_60_days"
        elif days_overdue <= 90:
            bucket = "61_90_days"
        else:
            bucket = "over_90_days"
        
        aging_buckets[bucket]["amount"] += amount
        aging_buckets[bucket]["count"] += 1
        aging_buckets[bucket]["invoices"].append(invoice_data)
    
    # Calculate totals
    total_amount = sum(bucket["amount"] for bucket in aging_buckets.values())
    total_count = sum(bucket["count"] for bucket in aging_buckets.values())
    
    return {
        "report_date": today.isoformat(),
        "total_amount": total_amount,
        "total_invoices": total_count,
        "aging_buckets": aging_buckets
    }

@router.get("/reports/performance")
async def get_supplier_performance_report(
    supplier_id: Optional[int] = Query(None),
    days: int = Query(90, description="Number of days for performance analysis"),
    db: Session = Depends(get_db)
):
    """Get supplier performance metrics"""
    from datetime import timedelta
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # Base query
    query = db.query(Supplier).filter(Supplier.is_active == True)
    if supplier_id:
        query = query.filter(Supplier.id == supplier_id)
    
    suppliers = query.all()
    performance_data = []
    
    for supplier in suppliers:
        # Get invoices for this supplier in the period
        invoices = db.query(SupplierInvoice).filter(
            and_(
                SupplierInvoice.supplier_id == supplier.id,
                SupplierInvoice.invoice_date >= start_date
            )
        ).all()
        
        # Get payments for this supplier in the period
        payments = db.query(SupplierPayment).filter(
            and_(
                SupplierPayment.supplier_id == supplier.id,
                SupplierPayment.payment_date >= start_date
            )
        ).all()
        
        # Calculate metrics
        total_invoices = len(invoices)
        total_invoice_amount = sum(float(inv.total_amount) for inv in invoices)
        total_payments = sum(float(pay.amount) for pay in payments)
        
        # Payment timeliness
        on_time_payments = 0
        late_payments = 0
        total_delay_days = 0
        
        for invoice in invoices:
            if invoice.payment_status == "paid":
                # Find payment date
                payment = db.query(SupplierPayment).filter(
                    SupplierPayment.invoice_id == invoice.id
                ).order_by(SupplierPayment.payment_date.desc()).first()
                
                if payment:
                    delay_days = (payment.payment_date.date() - invoice.due_date).days
                    if delay_days <= 0:
                        on_time_payments += 1
                    else:
                        late_payments += 1
                        total_delay_days += delay_days
        
        avg_delay_days = total_delay_days / max(late_payments, 1)
        payment_timeliness = (on_time_payments / max(total_invoices, 1)) * 100
        
        # Current status
        overdue_invoices = db.query(SupplierInvoice).filter(
            and_(
                SupplierInvoice.supplier_id == supplier.id,
                SupplierInvoice.payment_status != "paid",
                SupplierInvoice.due_date < end_date
            )
        ).count()
        
        performance_data.append({
            "supplier_id": supplier.id,
            "supplier_name": supplier.name,
            "contact_person": supplier.contact_person,
            "city": supplier.city,
            "metrics": {
                "total_invoices": total_invoices,
                "total_invoice_amount": total_invoice_amount,
                "total_payments": total_payments,
                "average_invoice_amount": total_invoice_amount / max(total_invoices, 1),
                "payment_timeliness_percent": payment_timeliness,
                "average_delay_days": avg_delay_days,
                "on_time_payments": on_time_payments,
                "late_payments": late_payments,
                "current_balance": float(supplier.current_balance),
                "overdue_invoices": overdue_invoices,
                "credit_utilization_percent": (float(supplier.current_balance) / max(float(supplier.credit_limit), 1)) * 100
            }
        })
    
    return {
        "report_date": end_date.isoformat(),
        "period_days": days,
        "suppliers": performance_data
    }

@router.get("/payment-reminders")
async def get_payment_reminders(db: Session = Depends(get_db)):
    """Get overdue invoices requiring payment reminders"""
    today = date.today()
    
    overdue_invoices = db.query(SupplierInvoice).join(Supplier).filter(
        and_(
            SupplierInvoice.payment_status != "paid",
            SupplierInvoice.due_date < today,
            Supplier.is_active == True
        )
    ).all()
    
    reminders = []
    for invoice in overdue_invoices:
        days_overdue = (today - invoice.due_date).days
        reminders.append({
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "supplier_id": invoice.supplier.id,
            "supplier_name": invoice.supplier.name,
            "contact_person": invoice.supplier.contact_person,
            "phone": invoice.supplier.mobile or invoice.supplier.phone,
            "due_date": invoice.due_date.isoformat(),
            "days_overdue": days_overdue,
            "balance_amount": float(invoice.balance_amount),
            "payment_terms_days": invoice.supplier.payment_terms_days
        })
    
    return sorted(reminders, key=lambda x: x["days_overdue"], reverse=True)

@router.get("/reports/summary")
async def get_supplier_summary(db: Session = Depends(get_db)):
    """Get supplier summary report"""
    # Get active suppliers count and total balance
    active_suppliers = db.query(Supplier).filter(Supplier.is_active == True).all()
    total_suppliers = len(active_suppliers)
    total_balance = sum(float(s.current_balance) for s in active_suppliers)
    
    # Get overdue invoices
    today = date.today()
    overdue_invoices = db.query(SupplierInvoice).join(Supplier).filter(
        and_(
            SupplierInvoice.payment_status != "paid",
            SupplierInvoice.due_date < today,
            Supplier.is_active == True
        )
    ).all()
    
    overdue_amount = sum(float(inv.balance_amount) for inv in overdue_invoices)
    
    # Calculate average payment terms
    avg_payment_terms = sum(s.payment_terms_days for s in active_suppliers) / max(total_suppliers, 1)
    
    return {
        "total_suppliers": total_suppliers,
        "total_outstanding": total_balance,
        "overdue_invoices": len(overdue_invoices),
        "overdue_amount": overdue_amount,
        "average_payment_terms": avg_payment_terms
    }