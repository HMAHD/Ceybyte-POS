"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                    Products API Router                                           │
│                                                                                                  │
│  Description: FastAPI router for product management endpoints.                                   │
│               Includes CRUD operations, search, and barcode generation.                         │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import List, Optional
from pydantic import BaseModel, Field
from decimal import Decimal

from database.connection import get_db
from models.product import Product
from models.category import Category
from models.unit_of_measure import UnitOfMeasure
from models.supplier import Supplier

router = APIRouter(prefix="/products", tags=["products"])

# Pydantic models for request/response
class ProductCreate(BaseModel):
    name_en: str = Field(..., min_length=1, max_length=200)
    name_si: Optional[str] = Field(None, max_length=200)
    name_ta: Optional[str] = Field(None, max_length=200)
    sku: Optional[str] = Field(None, max_length=50)
    barcode: Optional[str] = Field(None, max_length=50)
    internal_code: Optional[str] = Field(None, max_length=50)
    category_id: Optional[int] = None
    unit_of_measure_id: int
    supplier_id: Optional[int] = None
    cost_price: Decimal = Field(default=Decimal('0.00'), ge=0)
    selling_price: Decimal = Field(..., ge=0)
    wholesale_price: Optional[Decimal] = Field(None, ge=0)
    special_price: Optional[Decimal] = Field(None, ge=0)
    is_negotiable: bool = False
    min_selling_price: Optional[Decimal] = Field(None, ge=0)
    markup_percentage: Optional[Decimal] = Field(None, ge=0, le=1000)
    current_stock: Decimal = Field(default=Decimal('0.000'), ge=0)
    minimum_stock: Decimal = Field(default=Decimal('0.000'), ge=0)
    maximum_stock: Optional[Decimal] = Field(None, ge=0)
    reorder_level: Optional[Decimal] = Field(None, ge=0)
    is_active: bool = True
    is_service: bool = False
    track_inventory: bool = True
    allow_negative_stock: bool = False
    tax_rate: Decimal = Field(default=Decimal('0.00'), ge=0, le=100)
    tax_inclusive: bool = True
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)

class ProductUpdate(BaseModel):
    name_en: Optional[str] = Field(None, min_length=1, max_length=200)
    name_si: Optional[str] = Field(None, max_length=200)
    name_ta: Optional[str] = Field(None, max_length=200)
    sku: Optional[str] = Field(None, max_length=50)
    barcode: Optional[str] = Field(None, max_length=50)
    internal_code: Optional[str] = Field(None, max_length=50)
    category_id: Optional[int] = None
    unit_of_measure_id: Optional[int] = None
    supplier_id: Optional[int] = None
    cost_price: Optional[Decimal] = Field(None, ge=0)
    selling_price: Optional[Decimal] = Field(None, ge=0)
    wholesale_price: Optional[Decimal] = Field(None, ge=0)
    special_price: Optional[Decimal] = Field(None, ge=0)
    is_negotiable: Optional[bool] = None
    min_selling_price: Optional[Decimal] = Field(None, ge=0)
    markup_percentage: Optional[Decimal] = Field(None, ge=0, le=1000)
    current_stock: Optional[Decimal] = Field(None, ge=0)
    minimum_stock: Optional[Decimal] = Field(None, ge=0)
    maximum_stock: Optional[Decimal] = Field(None, ge=0)
    reorder_level: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None
    is_service: Optional[bool] = None
    track_inventory: Optional[bool] = None
    allow_negative_stock: Optional[bool] = None
    tax_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    tax_inclusive: Optional[bool] = None
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)

class ProductResponse(BaseModel):
    id: int
    name_en: str
    name_si: Optional[str]
    name_ta: Optional[str]
    sku: Optional[str]
    barcode: Optional[str]
    internal_code: Optional[str]
    category_id: Optional[int]
    unit_of_measure_id: int
    supplier_id: Optional[int]
    cost_price: Decimal
    selling_price: Decimal
    wholesale_price: Optional[Decimal]
    special_price: Optional[Decimal]
    is_negotiable: bool
    min_selling_price: Optional[Decimal]
    markup_percentage: Optional[Decimal]
    current_stock: Decimal
    minimum_stock: Decimal
    maximum_stock: Optional[Decimal]
    reorder_level: Optional[Decimal]
    is_active: bool
    is_service: bool
    track_inventory: bool
    allow_negative_stock: bool
    tax_rate: Decimal
    tax_inclusive: bool
    description: Optional[str]
    short_description: Optional[str]
    created_at: str
    updated_at: str
    
    # Related data
    category: Optional[dict] = None
    unit_of_measure: Optional[dict] = None
    supplier: Optional[dict] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    supplier_id: Optional[int] = Query(None),
    is_active: Optional[bool] = Query(None),
    low_stock_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get products with optional filtering and search"""
    try:
        query = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.unit_of_measure),
            joinedload(Product.supplier)
        )
        
        # Apply filters
        if search:
            search_filter = or_(
                Product.name_en.ilike(f"%{search}%"),
                Product.name_si.ilike(f"%{search}%"),
                Product.name_ta.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
                Product.barcode.ilike(f"%{search}%"),
                Product.internal_code.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if category_id is not None:
            query = query.filter(Product.category_id == category_id)
        
        if supplier_id is not None:
            query = query.filter(Product.supplier_id == supplier_id)
        
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)
        
        if low_stock_only:
            query = query.filter(
                and_(
                    Product.track_inventory == True,
                    Product.current_stock <= Product.minimum_stock
                )
            )
        
        # Apply pagination
        products = query.offset(skip).limit(limit).all()
        
        # Convert to response format
        result = []
        for product in products:
            product_dict = {
                **product.__dict__,
                'created_at': product.created_at.isoformat() if product.created_at else None,
                'updated_at': product.updated_at.isoformat() if product.updated_at else None,
                'category': {
                    'id': product.category.id,
                    'name_en': product.category.name_en,
                    'name_si': product.category.name_si,
                    'name_ta': product.category.name_ta
                } if product.category else None,
                'unit_of_measure': {
                    'id': product.unit_of_measure.id,
                    'name': product.unit_of_measure.name,
                    'abbreviation': product.unit_of_measure.abbreviation,
                    'allow_decimals': product.unit_of_measure.allow_decimals,
                    'decimal_places': product.unit_of_measure.decimal_places
                } if product.unit_of_measure else None,
                'supplier': {
                    'id': product.supplier.id,
                    'name': product.supplier.name,
                    'contact_person': product.supplier.contact_person
                } if product.supplier else None
            }
            result.append(product_dict)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a specific product by ID"""
    try:
        product = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.unit_of_measure),
            joinedload(Product.supplier)
        ).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {
            **product.__dict__,
            'created_at': product.created_at.isoformat() if product.created_at else None,
            'updated_at': product.updated_at.isoformat() if product.updated_at else None,
            'category': {
                'id': product.category.id,
                'name_en': product.category.name_en,
                'name_si': product.category.name_si,
                'name_ta': product.category.name_ta
            } if product.category else None,
            'unit_of_measure': {
                'id': product.unit_of_measure.id,
                'name': product.unit_of_measure.name,
                'abbreviation': product.unit_of_measure.abbreviation,
                'allow_decimals': product.unit_of_measure.allow_decimals,
                'decimal_places': product.unit_of_measure.decimal_places
            } if product.unit_of_measure else None,
            'supplier': {
                'id': product.supplier.id,
                'name': product.supplier.name,
                'contact_person': product.supplier.contact_person
            } if product.supplier else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch product: {str(e)}")

@router.post("/", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    try:
        # Check if SKU or barcode already exists
        if product.sku:
            existing = db.query(Product).filter(Product.sku == product.sku).first()
            if existing:
                raise HTTPException(status_code=400, detail="SKU already exists")
        
        if product.barcode:
            existing = db.query(Product).filter(Product.barcode == product.barcode).first()
            if existing:
                raise HTTPException(status_code=400, detail="Barcode already exists")
        
        # Validate foreign keys
        if product.category_id:
            category = db.query(Category).filter(Category.id == product.category_id).first()
            if not category:
                raise HTTPException(status_code=400, detail="Category not found")
        
        unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == product.unit_of_measure_id).first()
        if not unit:
            raise HTTPException(status_code=400, detail="Unit of measure not found")
        
        if product.supplier_id:
            supplier = db.query(Supplier).filter(Supplier.id == product.supplier_id).first()
            if not supplier:
                raise HTTPException(status_code=400, detail="Supplier not found")
        
        # Create product
        db_product = Product(**product.dict())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        # Fetch with relationships
        product_with_relations = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.unit_of_measure),
            joinedload(Product.supplier)
        ).filter(Product.id == db_product.id).first()
        
        return {
            **product_with_relations.__dict__,
            'created_at': product_with_relations.created_at.isoformat(),
            'updated_at': product_with_relations.updated_at.isoformat(),
            'category': {
                'id': product_with_relations.category.id,
                'name_en': product_with_relations.category.name_en,
                'name_si': product_with_relations.category.name_si,
                'name_ta': product_with_relations.category.name_ta
            } if product_with_relations.category else None,
            'unit_of_measure': {
                'id': product_with_relations.unit_of_measure.id,
                'name': product_with_relations.unit_of_measure.name,
                'abbreviation': product_with_relations.unit_of_measure.abbreviation,
                'allow_decimals': product_with_relations.unit_of_measure.allow_decimals,
                'decimal_places': product_with_relations.unit_of_measure.decimal_places
            },
            'supplier': {
                'id': product_with_relations.supplier.id,
                'name': product_with_relations.supplier.name,
                'contact_person': product_with_relations.supplier.contact_person
            } if product_with_relations.supplier else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    """Update an existing product"""
    try:
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Check for duplicate SKU or barcode (excluding current product)
        update_data = product.dict(exclude_unset=True)
        
        if 'sku' in update_data and update_data['sku']:
            existing = db.query(Product).filter(
                Product.sku == update_data['sku'],
                Product.id != product_id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="SKU already exists")
        
        if 'barcode' in update_data and update_data['barcode']:
            existing = db.query(Product).filter(
                Product.barcode == update_data['barcode'],
                Product.id != product_id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Barcode already exists")
        
        # Validate foreign keys
        if 'category_id' in update_data and update_data['category_id']:
            category = db.query(Category).filter(Category.id == update_data['category_id']).first()
            if not category:
                raise HTTPException(status_code=400, detail="Category not found")
        
        if 'unit_of_measure_id' in update_data:
            unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == update_data['unit_of_measure_id']).first()
            if not unit:
                raise HTTPException(status_code=400, detail="Unit of measure not found")
        
        if 'supplier_id' in update_data and update_data['supplier_id']:
            supplier = db.query(Supplier).filter(Supplier.id == update_data['supplier_id']).first()
            if not supplier:
                raise HTTPException(status_code=400, detail="Supplier not found")
        
        # Update product
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        
        # Fetch with relationships
        product_with_relations = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.unit_of_measure),
            joinedload(Product.supplier)
        ).filter(Product.id == product_id).first()
        
        return {
            **product_with_relations.__dict__,
            'created_at': product_with_relations.created_at.isoformat(),
            'updated_at': product_with_relations.updated_at.isoformat(),
            'category': {
                'id': product_with_relations.category.id,
                'name_en': product_with_relations.category.name_en,
                'name_si': product_with_relations.category.name_si,
                'name_ta': product_with_relations.category.name_ta
            } if product_with_relations.category else None,
            'unit_of_measure': {
                'id': product_with_relations.unit_of_measure.id,
                'name': product_with_relations.unit_of_measure.name,
                'abbreviation': product_with_relations.unit_of_measure.abbreviation,
                'allow_decimals': product_with_relations.unit_of_measure.allow_decimals,
                'decimal_places': product_with_relations.unit_of_measure.decimal_places
            },
            'supplier': {
                'id': product_with_relations.supplier.id,
                'name': product_with_relations.supplier.name,
                'contact_person': product_with_relations.supplier.contact_person
            } if product_with_relations.supplier else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update product: {str(e)}")

@router.delete("/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product (soft delete by setting is_active to False)"""
    try:
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Soft delete
        db_product.is_active = False
        db.commit()
        
        return {"message": "Product deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")

@router.get("/barcode/{barcode}", response_model=ProductResponse)
async def get_product_by_barcode(barcode: str, db: Session = Depends(get_db)):
    """Get product by barcode"""
    try:
        product = db.query(Product).options(
            joinedload(Product.category),
            joinedload(Product.unit_of_measure),
            joinedload(Product.supplier)
        ).filter(Product.barcode == barcode, Product.is_active == True).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {
            **product.__dict__,
            'created_at': product.created_at.isoformat(),
            'updated_at': product.updated_at.isoformat(),
            'category': {
                'id': product.category.id,
                'name_en': product.category.name_en,
                'name_si': product.category.name_si,
                'name_ta': product.category.name_ta
            } if product.category else None,
            'unit_of_measure': {
                'id': product.unit_of_measure.id,
                'name': product.unit_of_measure.name,
                'abbreviation': product.unit_of_measure.abbreviation,
                'allow_decimals': product.unit_of_measure.allow_decimals,
                'decimal_places': product.unit_of_measure.decimal_places
            },
            'supplier': {
                'id': product.supplier.id,
                'name': product.supplier.name,
                'contact_person': product.supplier.contact_person
            } if product.supplier else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch product by barcode: {str(e)}")

@router.post("/{product_id}/generate-barcode")
async def generate_barcode(product_id: int, db: Session = Depends(get_db)):
    """Generate a barcode for a product"""
    try:
        import uuid
        
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if product.barcode:
            raise HTTPException(status_code=400, detail="Product already has a barcode")
        
        # Generate a simple barcode based on product ID and timestamp
        barcode = f"CB{product_id:06d}{str(uuid.uuid4())[:8].upper()}"
        
        # Ensure uniqueness
        while db.query(Product).filter(Product.barcode == barcode).first():
            barcode = f"CB{product_id:06d}{str(uuid.uuid4())[:8].upper()}"
        
        product.barcode = barcode
        db.commit()
        
        return {"barcode": barcode, "message": "Barcode generated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to generate barcode: {str(e)}")