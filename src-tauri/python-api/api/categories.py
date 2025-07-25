"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   Categories API Router                                          │
│                                                                                                  │
│  Description: FastAPI router for category management with hierarchical structure.               │
│               Supports parent-child relationships and multi-language names.                     │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from pydantic import BaseModel, Field

from database.connection import get_db
from models.category import Category

router = APIRouter(prefix="/categories", tags=["categories"])

# Pydantic models
class CategoryCreate(BaseModel):
    name_en: str = Field(..., min_length=1, max_length=100)
    name_si: Optional[str] = Field(None, max_length=100)
    name_ta: Optional[str] = Field(None, max_length=100)
    parent_id: Optional[int] = None
    sort_order: int = Field(default=0)
    is_negotiable_default: bool = Field(default=False)
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=7)
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    name_en: Optional[str] = Field(None, min_length=1, max_length=100)
    name_si: Optional[str] = Field(None, max_length=100)
    name_ta: Optional[str] = Field(None, max_length=100)
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    is_negotiable_default: Optional[bool] = None
    icon: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=7)
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name_en: str
    name_si: Optional[str]
    name_ta: Optional[str]
    parent_id: Optional[int]
    sort_order: int
    is_negotiable_default: bool
    icon: Optional[str]
    color: Optional[str]
    description: Optional[str]
    created_at: str
    updated_at: str
    
    # Hierarchical data
    parent: Optional[dict] = None
    children: List[dict] = []
    product_count: int = 0

    class Config:
        from_attributes = True

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    include_children: bool = Query(True),
    parent_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Get categories with optional hierarchical structure"""
    try:
        query = db.query(Category)
        
        if parent_id is not None:
            query = query.filter(Category.parent_id == parent_id)
        elif not include_children:
            # Only root categories if not including children
            query = query.filter(Category.parent_id.is_(None))
        
        categories = query.order_by(Category.sort_order, Category.name_en).all()
        
        result = []
        for category in categories:
            category_dict = {
                **category.__dict__,
                'created_at': category.created_at.isoformat() if category.created_at else None,
                'updated_at': category.updated_at.isoformat() if category.updated_at else None,
                'parent': {
                    'id': category.parent.id,
                    'name_en': category.parent.name_en,
                    'name_si': category.parent.name_si,
                    'name_ta': category.parent.name_ta
                } if category.parent else None,
                'children': [],
                'product_count': len(category.products) if hasattr(category, 'products') else 0
            }
            
            if include_children and category.children:
                category_dict['children'] = [
                    {
                        'id': child.id,
                        'name_en': child.name_en,
                        'name_si': child.name_si,
                        'name_ta': child.name_ta,
                        'sort_order': child.sort_order,
                        'product_count': len(child.products) if hasattr(child, 'products') else 0
                    }
                    for child in sorted(category.children, key=lambda x: (x.sort_order, x.name_en))
                ]
            
            result.append(category_dict)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")

@router.get("/tree", response_model=List[CategoryResponse])
async def get_category_tree(db: Session = Depends(get_db)):
    """Get complete category tree structure"""
    try:
        # Get all categories with their relationships
        categories = db.query(Category).options(
            joinedload(Category.parent),
            joinedload(Category.children)
        ).all()
        
        # Build tree structure
        category_map = {}
        root_categories = []
        
        # First pass: create all category objects
        for category in categories:
            category_dict = {
                **category.__dict__,
                'created_at': category.created_at.isoformat() if category.created_at else None,
                'updated_at': category.updated_at.isoformat() if category.updated_at else None,
                'parent': None,
                'children': [],
                'product_count': len(category.products) if hasattr(category, 'products') else 0
            }
            category_map[category.id] = category_dict
            
            if category.parent_id is None:
                root_categories.append(category_dict)
        
        # Second pass: build parent-child relationships
        for category in categories:
            if category.parent_id:
                parent_dict = category_map.get(category.parent_id)
                if parent_dict:
                    category_map[category.id]['parent'] = {
                        'id': parent_dict['id'],
                        'name_en': parent_dict['name_en'],
                        'name_si': parent_dict['name_si'],
                        'name_ta': parent_dict['name_ta']
                    }
                    parent_dict['children'].append(category_map[category.id])
        
        # Sort children by sort_order and name
        def sort_children(cat_dict):
            cat_dict['children'].sort(key=lambda x: (x['sort_order'], x['name_en']))
            for child in cat_dict['children']:
                sort_children(child)
        
        for root_cat in root_categories:
            sort_children(root_cat)
        
        # Sort root categories
        root_categories.sort(key=lambda x: (x['sort_order'], x['name_en']))
        
        return root_categories
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch category tree: {str(e)}")

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category by ID"""
    try:
        category = db.query(Category).options(
            joinedload(Category.parent),
            joinedload(Category.children)
        ).filter(Category.id == category_id).first()
        
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {
            **category.__dict__,
            'created_at': category.created_at.isoformat() if category.created_at else None,
            'updated_at': category.updated_at.isoformat() if category.updated_at else None,
            'parent': {
                'id': category.parent.id,
                'name_en': category.parent.name_en,
                'name_si': category.parent.name_si,
                'name_ta': category.parent.name_ta
            } if category.parent else None,
            'children': [
                {
                    'id': child.id,
                    'name_en': child.name_en,
                    'name_si': child.name_si,
                    'name_ta': child.name_ta,
                    'sort_order': child.sort_order,
                    'product_count': len(child.products) if hasattr(child, 'products') else 0
                }
                for child in sorted(category.children, key=lambda x: (x.sort_order, x.name_en))
            ],
            'product_count': len(category.products) if hasattr(category, 'products') else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch category: {str(e)}")

@router.post("/", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    try:
        # Validate parent category exists if specified
        if category.parent_id:
            parent = db.query(Category).filter(Category.id == category.parent_id).first()
            if not parent:
                raise HTTPException(status_code=400, detail="Parent category not found")
            
            # Prevent circular references (basic check)
            if category.parent_id == category.parent_id:
                raise HTTPException(status_code=400, detail="Category cannot be its own parent")
        
        # Create category
        db_category = Category(**category.dict())
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        
        # Fetch with relationships
        category_with_relations = db.query(Category).options(
            joinedload(Category.parent),
            joinedload(Category.children)
        ).filter(Category.id == db_category.id).first()
        
        return {
            **category_with_relations.__dict__,
            'created_at': category_with_relations.created_at.isoformat(),
            'updated_at': category_with_relations.updated_at.isoformat(),
            'parent': {
                'id': category_with_relations.parent.id,
                'name_en': category_with_relations.parent.name_en,
                'name_si': category_with_relations.parent.name_si,
                'name_ta': category_with_relations.parent.name_ta
            } if category_with_relations.parent else None,
            'children': [],
            'product_count': 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create category: {str(e)}")

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    """Update an existing category"""
    try:
        db_category = db.query(Category).filter(Category.id == category_id).first()
        if not db_category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        update_data = category.dict(exclude_unset=True)
        
        # Validate parent category if being updated
        if 'parent_id' in update_data and update_data['parent_id']:
            if update_data['parent_id'] == category_id:
                raise HTTPException(status_code=400, detail="Category cannot be its own parent")
            
            parent = db.query(Category).filter(Category.id == update_data['parent_id']).first()
            if not parent:
                raise HTTPException(status_code=400, detail="Parent category not found")
            
            # Check for circular reference (basic check - would need recursive check for deep hierarchies)
            if parent.parent_id == category_id:
                raise HTTPException(status_code=400, detail="Circular reference detected")
        
        # Update category
        for field, value in update_data.items():
            setattr(db_category, field, value)
        
        db.commit()
        db.refresh(db_category)
        
        # Fetch with relationships
        category_with_relations = db.query(Category).options(
            joinedload(Category.parent),
            joinedload(Category.children)
        ).filter(Category.id == category_id).first()
        
        return {
            **category_with_relations.__dict__,
            'created_at': category_with_relations.created_at.isoformat(),
            'updated_at': category_with_relations.updated_at.isoformat(),
            'parent': {
                'id': category_with_relations.parent.id,
                'name_en': category_with_relations.parent.name_en,
                'name_si': category_with_relations.parent.name_si,
                'name_ta': category_with_relations.parent.name_ta
            } if category_with_relations.parent else None,
            'children': [
                {
                    'id': child.id,
                    'name_en': child.name_en,
                    'name_si': child.name_si,
                    'name_ta': child.name_ta,
                    'sort_order': child.sort_order,
                    'product_count': len(child.products) if hasattr(child, 'products') else 0
                }
                for child in sorted(category_with_relations.children, key=lambda x: (x.sort_order, x.name_en))
            ],
            'product_count': len(category_with_relations.products) if hasattr(category_with_relations, 'products') else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update category: {str(e)}")

@router.delete("/{category_id}")
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category (only if no products are assigned)"""
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Check if category has products
        if hasattr(category, 'products') and len(category.products) > 0:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete category with assigned products"
            )
        
        # Check if category has children
        if category.children:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete category with subcategories"
            )
        
        db.delete(category)
        db.commit()
        
        return {"message": "Category deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete category: {str(e)}")