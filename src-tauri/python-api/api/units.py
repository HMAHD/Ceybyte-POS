"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                Units of Measure API Router                                       │
│                                                                                                  │
│  Description: FastAPI router for unit of measure management with decimal precision settings.     │
│               Supports various units like pieces, kg, liters with configurable decimals.        │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, Field

from database.connection import get_db
from models.unit_of_measure import UnitOfMeasure

router = APIRouter(prefix="/units", tags=["units"])

# Pydantic models
class UnitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    abbreviation: str = Field(..., min_length=1, max_length=10)
    allow_decimals: bool = Field(default=True)
    decimal_places: int = Field(default=2, ge=0, le=6)
    base_unit_id: Optional[int] = None
    conversion_factor: float = Field(default=1.0, gt=0)
    symbol: Optional[str] = Field(None, max_length=10)

class UnitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    abbreviation: Optional[str] = Field(None, min_length=1, max_length=10)
    allow_decimals: Optional[bool] = None
    decimal_places: Optional[int] = Field(None, ge=0, le=6)
    base_unit_id: Optional[int] = None
    conversion_factor: Optional[float] = Field(None, gt=0)
    symbol: Optional[str] = Field(None, max_length=10)

class UnitResponse(BaseModel):
    id: int
    name: str
    abbreviation: str
    allow_decimals: bool
    decimal_places: int
    base_unit_id: Optional[int]
    conversion_factor: float
    symbol: Optional[str]
    created_at: str
    updated_at: str
    
    # Related data
    base_unit: Optional[dict] = None
    product_count: int = 0

    class Config:
        from_attributes = True

@router.get("/", response_model=List[UnitResponse])
async def get_units(db: Session = Depends(get_db)):
    """Get all units of measure"""
    try:
        units = db.query(UnitOfMeasure).order_by(UnitOfMeasure.name).all()
        
        result = []
        for unit in units:
            unit_dict = {
                **unit.__dict__,
                'created_at': unit.created_at.isoformat() if unit.created_at else None,
                'updated_at': unit.updated_at.isoformat() if unit.updated_at else None,
                'base_unit': None,
                'product_count': len(unit.products) if hasattr(unit, 'products') else 0
            }
            
            # Add base unit info if exists
            if unit.base_unit_id:
                base_unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == unit.base_unit_id).first()
                if base_unit:
                    unit_dict['base_unit'] = {
                        'id': base_unit.id,
                        'name': base_unit.name,
                        'abbreviation': base_unit.abbreviation
                    }
            
            result.append(unit_dict)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch units: {str(e)}")

@router.get("/{unit_id}", response_model=UnitResponse)
async def get_unit(unit_id: int, db: Session = Depends(get_db)):
    """Get a specific unit of measure by ID"""
    try:
        unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == unit_id).first()
        
        if not unit:
            raise HTTPException(status_code=404, detail="Unit of measure not found")
        
        unit_dict = {
            **unit.__dict__,
            'created_at': unit.created_at.isoformat() if unit.created_at else None,
            'updated_at': unit.updated_at.isoformat() if unit.updated_at else None,
            'base_unit': None,
            'product_count': len(unit.products) if hasattr(unit, 'products') else 0
        }
        
        # Add base unit info if exists
        if unit.base_unit_id:
            base_unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == unit.base_unit_id).first()
            if base_unit:
                unit_dict['base_unit'] = {
                    'id': base_unit.id,
                    'name': base_unit.name,
                    'abbreviation': base_unit.abbreviation
                }
        
        return unit_dict
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch unit: {str(e)}")

@router.post("/", response_model=UnitResponse)
async def create_unit(unit: UnitCreate, db: Session = Depends(get_db)):
    """Create a new unit of measure"""
    try:
        # Check if abbreviation already exists
        existing = db.query(UnitOfMeasure).filter(UnitOfMeasure.abbreviation == unit.abbreviation).first()
        if existing:
            raise HTTPException(status_code=400, detail="Unit abbreviation already exists")
        
        # Validate base unit if specified
        if unit.base_unit_id:
            base_unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == unit.base_unit_id).first()
            if not base_unit:
                raise HTTPException(status_code=400, detail="Base unit not found")
            
            # Prevent self-reference
            if unit.base_unit_id == unit.base_unit_id:
                raise HTTPException(status_code=400, detail="Unit cannot be its own base unit")
        
        # Create unit
        db_unit = UnitOfMeasure(**unit.dict())
        db.add(db_unit)
        db.commit()
        db.refresh(db_unit)
        
        unit_dict = {
            **db_unit.__dict__,
            'created_at': db_unit.created_at.isoformat(),
            'updated_at': db_unit.updated_at.isoformat(),
            'base_unit': None,
            'product_count': 0
        }
        
        # Add base unit info if exists
        if db_unit.base_unit_id:
            base_unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == db_unit.base_unit_id).first()
            if base_unit:
                unit_dict['base_unit'] = {
                    'id': base_unit.id,
                    'name': base_unit.name,
                    'abbreviation': base_unit.abbreviation
                }
        
        return unit_dict
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create unit: {str(e)}")

@router.put("/{unit_id}", response_model=UnitResponse)
async def update_unit(unit_id: int, unit: UnitUpdate, db: Session = Depends(get_db)):
    """Update an existing unit of measure"""
    try:
        db_unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == unit_id).first()
        if not db_unit:
            raise HTTPException(status_code=404, detail="Unit of measure not found")
        
        update_data = unit.dict(exclude_unset=True)
        
        # Check for duplicate abbreviation (excluding current unit)
        if 'abbreviation' in update_data:
            existing = db.query(UnitOfMeasure).filter(
                UnitOfMeasure.abbreviation == update_data['abbreviation'],
                UnitOfMeasure.id != unit_id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Unit abbreviation already exists")
        
        # Validate base unit if being updated
        if 'base_unit_id' in update_data and update_data['base_unit_id']:
            if update_data['base_unit_id'] == unit_id:
                raise HTTPException(status_code=400, detail="Unit cannot be its own base unit")
            
            base_unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == update_data['base_unit_id']).first()
            if not base_unit:
                raise HTTPException(status_code=400, detail="Base unit not found")
        
        # Update unit
        for field, value in update_data.items():
            setattr(db_unit, field, value)
        
        db.commit()
        db.refresh(db_unit)
        
        unit_dict = {
            **db_unit.__dict__,
            'created_at': db_unit.created_at.isoformat(),
            'updated_at': db_unit.updated_at.isoformat(),
            'base_unit': None,
            'product_count': len(db_unit.products) if hasattr(db_unit, 'products') else 0
        }
        
        # Add base unit info if exists
        if db_unit.base_unit_id:
            base_unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == db_unit.base_unit_id).first()
            if base_unit:
                unit_dict['base_unit'] = {
                    'id': base_unit.id,
                    'name': base_unit.name,
                    'abbreviation': base_unit.abbreviation
                }
        
        return unit_dict
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update unit: {str(e)}")

@router.delete("/{unit_id}")
async def delete_unit(unit_id: int, db: Session = Depends(get_db)):
    """Delete a unit of measure (only if no products are using it)"""
    try:
        unit = db.query(UnitOfMeasure).filter(UnitOfMeasure.id == unit_id).first()
        if not unit:
            raise HTTPException(status_code=404, detail="Unit of measure not found")
        
        # Check if unit is being used by products
        if hasattr(unit, 'products') and len(unit.products) > 0:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete unit of measure that is being used by products"
            )
        
        # Check if unit is being used as base unit by other units
        dependent_units = db.query(UnitOfMeasure).filter(UnitOfMeasure.base_unit_id == unit_id).all()
        if dependent_units:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete unit that is used as base unit by other units"
            )
        
        db.delete(unit)
        db.commit()
        
        return {"message": "Unit of measure deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete unit: {str(e)}")

@router.post("/seed")
async def seed_default_units(db: Session = Depends(get_db)):
    """Seed database with common units of measure"""
    try:
        default_units = [
            {"name": "Pieces", "abbreviation": "pcs", "allow_decimals": False, "decimal_places": 0, "symbol": "pcs"},
            {"name": "Kilograms", "abbreviation": "kg", "allow_decimals": True, "decimal_places": 3, "symbol": "kg"},
            {"name": "Grams", "abbreviation": "g", "allow_decimals": True, "decimal_places": 2, "symbol": "g"},
            {"name": "Liters", "abbreviation": "L", "allow_decimals": True, "decimal_places": 2, "symbol": "L"},
            {"name": "Milliliters", "abbreviation": "ml", "allow_decimals": True, "decimal_places": 0, "symbol": "ml"},
            {"name": "Meters", "abbreviation": "m", "allow_decimals": True, "decimal_places": 2, "symbol": "m"},
            {"name": "Centimeters", "abbreviation": "cm", "allow_decimals": True, "decimal_places": 1, "symbol": "cm"},
            {"name": "Boxes", "abbreviation": "box", "allow_decimals": False, "decimal_places": 0, "symbol": "box"},
            {"name": "Packets", "abbreviation": "pkt", "allow_decimals": False, "decimal_places": 0, "symbol": "pkt"},
            {"name": "Bottles", "abbreviation": "btl", "allow_decimals": False, "decimal_places": 0, "symbol": "btl"}
        ]
        
        created_count = 0
        for unit_data in default_units:
            # Check if unit already exists
            existing = db.query(UnitOfMeasure).filter(UnitOfMeasure.abbreviation == unit_data["abbreviation"]).first()
            if not existing:
                db_unit = UnitOfMeasure(**unit_data)
                db.add(db_unit)
                created_count += 1
        
        db.commit()
        
        return {"message": f"Seeded {created_count} default units of measure"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to seed units: {str(e)}")