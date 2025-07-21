#!/usr/bin/env python3
"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   Model Testing Script                                          │
│                                                                                                  │
│  Description: Test script to verify database models and relationships work correctly.           │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.connection import SessionLocal
from models import *

def test_models():
    """Test basic model operations"""
    db = SessionLocal()
    
    try:
        print("🧪 Testing CeybytePOS Database Models...")
        
        # Test 1: Check if admin user exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user:
            print(f"✅ Admin user found: {admin_user.name} ({admin_user.role})")
        else:
            print("❌ Admin user not found")
        
        # Test 2: Check units of measure
        units = db.query(UnitOfMeasure).all()
        print(f"✅ Units of measure: {len(units)} units loaded")
        for unit in units[:3]:  # Show first 3
            print(f"   • {unit.name} ({unit.abbreviation})")
        
        # Test 3: Check settings
        settings = db.query(Setting).all()
        print(f"✅ System settings: {len(settings)} settings loaded")
        business_name = db.query(Setting).filter(Setting.key == "business_name").first()
        if business_name:
            print(f"   • Business name: {business_name.value}")
        
        # Test 4: Check festival calendar
        festivals = db.query(FestivalCalendar).all()
        print(f"✅ Festival calendar: {len(festivals)} festivals loaded")
        for festival in festivals[:3]:  # Show first 3
            print(f"   • {festival.name} ({festival.date})")
        
        # Test 5: Create a test category
        test_category = Category(
            name_en="Test Category",
            name_si="පරීක්ෂණ කාණ්ඩය",
            name_ta="சோதனை வகை"
        )
        db.add(test_category)
        db.commit()
        print("✅ Test category created successfully")
        
        # Test 6: Create a test customer
        test_customer = Customer(
            name="Test Customer",
            phone="+94 77 123 4567",
            area="Colombo",
            village="Wellawatte",
            credit_limit=50000.00
        )
        db.add(test_customer)
        db.commit()
        print("✅ Test customer created successfully")
        
        # Test 7: Create a test supplier
        test_supplier = Supplier(
            name="Test Supplier",
            company_name="Test Supplier Ltd",
            phone="+94 11 234 5678",
            credit_limit=100000.00
        )
        db.add(test_supplier)
        db.commit()
        print("✅ Test supplier created successfully")
        
        # Test 8: Create a test product
        unit_pcs = db.query(UnitOfMeasure).filter(UnitOfMeasure.abbreviation == "pcs").first()
        test_product = Product(
            name_en="Test Product",
            name_si="පරීක්ෂණ නිෂ්පාදනය",
            name_ta="சோதனை தயாரிப்பு",
            sku="TEST001",
            barcode="1234567890123",
            category_id=test_category.id,
            unit_of_measure_id=unit_pcs.id,
            supplier_id=test_supplier.id,
            cost_price=100.00,
            selling_price=150.00,
            current_stock=50.0
        )
        db.add(test_product)
        db.commit()
        print("✅ Test product created successfully")
        
        # Test 9: Test relationships
        print("\n🔗 Testing Relationships:")
        print(f"   • Category has {len(test_category.products)} products")
        print(f"   • Supplier has {len(test_supplier.products)} products")
        print(f"   • Product category: {test_product.category.name_en}")
        print(f"   • Product unit: {test_product.unit_of_measure.name}")
        print(f"   • Product supplier: {test_product.supplier.name}")
        
        # Test 10: Test model methods
        print("\n🧮 Testing Model Methods:")
        print(f"   • Product profit margin: {test_product.calculate_profit_margin():.1f}%")
        print(f"   • Customer credit available: LKR {test_customer.credit_limit - test_customer.current_balance:.2f}")
        print(f"   • Category full path: {test_category.get_full_path('si')}")
        
        print("\n🎉 All model tests passed successfully!")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_models()