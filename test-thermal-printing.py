#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                Thermal Printing Test Script                                     ║
║                                                                                                  ║
║  Description: Test script to verify thermal printing with multi-language support.              ║
║               Demonstrates character transliteration and receipt formatting.                    ║
║                                                                                                  ║
║  Author: Ceybyte Development Team                                                                ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

import sys
import os

# Add the src-tauri/python-api directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src-tauri', 'python-api'))

try:
    from utils.printing import ThermalPrinter
    from config.printer_config import detect_printer, LANGUAGE_PRINT_SETTINGS
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you have activated the virtual environment and installed dependencies:")
    print("  .venv\\Scripts\\activate")
    print("  pip install -r src-tauri/python-api/requirements.txt")
    sys.exit(1)

def test_transliteration():
    """Test character transliteration without actual printing"""
    print("Testing Character Transliteration")
    print("=" * 50)
    
    # Create printer instance for testing (file mode - no actual printer needed)
    try:
        printer = ThermalPrinter('file', filename='test_receipt.txt')
        
        # Test texts in different languages
        test_texts = {
            'English': 'Hello World! Welcome to CeybytePOS',
            'Sinhala': 'ආයුබෝවන්! CeybytePOS වෙත සාදරයෙන් පිළිගනිමු',
            'Tamil': 'வணக்கம்! CeybytePOS க்கு வரவேற்கிறோம்',
            'Mixed': 'සාම්පල් Shop / Sample கடை - Rs. 1,500.00'
        }
        
        for language, text in test_texts.items():
            transliterated = printer.transliterate_text(text)
            print(f"{language:10}: {text}")
            print(f"{'Thermal':10}: {transliterated}")
            print("-" * 50)
        
        printer.close()
        
    except Exception as e:
        print(f"Error during transliteration test: {e}")

def test_receipt_formatting():
    """Test complete receipt formatting"""
    print("\nTesting Receipt Formatting")
    print("=" * 50)
    
    try:
        # Create printer instance (file mode for testing)
        printer = ThermalPrinter('file', filename='sample_receipt.txt')
        
        # Sample receipt data with multi-language content
        receipt_data = {
            'business_name': 'සාම්පල් ශොප් / Sample Shop',
            'business_address': 'කොළඹ, ශ්‍රී ලංකාව / Colombo, Sri Lanka',
            'business_phone': '+94 11 234 5678',
            'receipt_number': 'R001',
            'date_time': '2025-01-22 10:30 AM',
            'items': [
                {'name': 'බත් / Rice', 'quantity': 2, 'price': 150.00},
                {'name': 'කිරි / Milk', 'quantity': 1, 'price': 200.00},
                {'name': 'පාන් / Bread', 'quantity': 3, 'price': 50.00},
            ],
            'subtotal': 650.00,
            'tax': 97.50,
            'discount': 0.00,
            'total': 747.50,
            'payment_method': 'මුදල් / Cash',
            'change': 52.50,
            'footer_message': 'ස්තූතියි! / Thank You!'
        }
        
        # Print the receipt
        success = printer.print_receipt(receipt_data)
        
        if success:
            print("Receipt printed successfully to 'sample_receipt.txt'")
            print("\nReceipt Preview:")
            print("-" * 50)
            
            # Show the generated receipt
            try:
                with open('sample_receipt.txt', 'r', encoding='utf-8') as f:
                    content = f.read()
                    print(content)
            except:
                print("Could not read the generated receipt file")
        else:
            print("Failed to print receipt")
        
        printer.close()
        
    except Exception as e:
        print(f"Error during receipt formatting test: {e}")

def show_printer_info():
    """Show information about thermal printing"""
    print("\nThermal Printer Information")
    print("=" * 50)
    
    print("Supported Character Sets:")
    for charset, code in ThermalPrinter(printer_type='file').config.CHARSET_ENCODINGS.items():
        print(f"  {charset:12}: Code {code}")
    
    print("\nLanguage Settings:")
    for lang, settings in LANGUAGE_PRINT_SETTINGS.items():
        print(f"  {lang.title():10}:")
        print(f"    Charset: {settings['charset']}")
        print(f"    Transliterate: {settings['transliterate']}")
        if 'warning' in settings:
            print(f"    Warning: {settings['warning']}")
    
    print("\nCharacter Fallback Examples:")
    sample_chars = {
        'Sinhala': ['අ', 'ක', 'ග', 'ච', 'ජ', 'ට', 'ත', 'න', 'ප', 'ම', 'ය', 'ර', 'ල', 'ව', 'ස', 'හ'],
        'Tamil': ['அ', 'க', 'ங', 'ச', 'ஞ', 'ட', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'வ', 'ழ', 'ள'],
        'Currency': ['₹', '€', '£', '¥'],
        'Symbols': ['°', '±', '×', '÷', '"', '"', ''', ''']
    }
    
    printer = ThermalPrinter('file')
    for category, chars in sample_chars.items():
        print(f"\n  {category}:")
        for char in chars:
            fallback = printer.transliterate_text(char)
            print(f"    {char} → {fallback}")
    printer.close()

def main():
    """Main test function"""
    print("CeybytePOS Thermal Printing Test")
    print("=" * 50)
    print("This script tests thermal printing capabilities including:")
    print("- Character transliteration for Sinhala and Tamil")
    print("- Receipt formatting and layout")
    print("- Multi-language support")
    print("- Printer compatibility")
    print()
    
    # Run tests
    test_transliteration()
    test_receipt_formatting()
    show_printer_info()
    
    print("\n" + "=" * 50)
    print("Test completed!")
    print("\nGenerated files:")
    print("- test_receipt.txt (transliteration test)")
    print("- sample_receipt.txt (formatted receipt)")
    print("\nTo test with actual thermal printer:")
    print("1. Connect your thermal printer via USB")
    print("2. Update printer configuration in config/printer_config.py")
    print("3. Change printer_type from 'file' to 'usb' in the code")
    print("4. Run the test again")

if __name__ == "__main__":
    main()