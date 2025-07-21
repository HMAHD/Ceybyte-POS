"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                   Printer Configuration                                          ║
║                                                                                                  ║
║  Description: Configuration settings for thermal printers commonly used in Sri Lanka.            ║
║               Includes vendor IDs, character sets, and printer-specific settings.                ║
║                                                                                                  ║
║  Author: Akash Hasendra                                                                          ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

# Common thermal printer configurations used in Sri Lanka
PRINTER_CONFIGS = {
    # Epson TM series (most common in Sri Lanka)
    'epson_tm_t20': {
        'vendor_id': 0x04b8,
        'product_id': 0x0202,
        'width_mm': 80,
        'chars_per_line': 32,
        'supported_charsets': ['CP437', 'CP850', 'ISO8859-1'],
        'has_cutter': True,
        'has_cash_drawer': True,
    },
    
    'epson_tm_t82': {
        'vendor_id': 0x04b8,
        'product_id': 0x0202,
        'width_mm': 80,
        'chars_per_line': 32,
        'supported_charsets': ['CP437', 'CP850', 'ISO8859-1', 'CP1252'],
        'has_cutter': True,
        'has_cash_drawer': True,
    },
    
    # Star TSP series
    'star_tsp100': {
        'vendor_id': 0x0519,
        'product_id': 0x0001,
        'width_mm': 80,
        'chars_per_line': 32,
        'supported_charsets': ['CP437', 'CP850'],
        'has_cutter': True,
        'has_cash_drawer': True,
    },
    
    # Generic 80mm thermal printers
    'generic_80mm': {
        'vendor_id': 0x0416,
        'product_id': 0x5011,
        'width_mm': 80,
        'chars_per_line': 32,
        'supported_charsets': ['CP437'],
        'has_cutter': True,
        'has_cash_drawer': False,
    },
    
    # 58mm thermal printers (smaller, portable)
    'generic_58mm': {
        'vendor_id': 0x0416,
        'product_id': 0x5011,
        'width_mm': 58,
        'chars_per_line': 24,
        'supported_charsets': ['CP437'],
        'has_cutter': False,
        'has_cash_drawer': False,
    },
}

# Language-specific printing recommendations
LANGUAGE_PRINT_SETTINGS = {
    'english': {
        'charset': 'CP437',
        'transliterate': False,
        'font_multiplier': 1,
    },
    
    'sinhala': {
        'charset': 'CP437',  # Fallback to ASCII
        'transliterate': True,  # Convert to ASCII equivalents
        'font_multiplier': 1.2,  # Slightly larger for readability
        'warning': 'Sinhala characters will be transliterated to ASCII equivalents'
    },
    
    'tamil': {
        'charset': 'CP437',  # Fallback to ASCII
        'transliterate': True,  # Convert to ASCII equivalents
        'font_multiplier': 1.2,  # Slightly larger for readability
        'warning': 'Tamil characters will be transliterated to ASCII equivalents'
    },
}

# Receipt templates for different languages
RECEIPT_TEMPLATES = {
    'english': {
        'header': {
            'business_name': '{business_name}',
            'address': '{address}',
            'phone': 'Tel: {phone}',
            'email': 'Email: {email}',
        },
        'receipt_info': {
            'number': 'Receipt No: {receipt_no}',
            'date': 'Date: {date}',
            'cashier': 'Cashier: {cashier}',
        },
        'items_header': 'ITEMS',
        'totals': {
            'subtotal': 'Subtotal:',
            'tax': 'Tax:',
            'discount': 'Discount:',
            'total': 'TOTAL:',
        },
        'payment': {
            'method': 'Payment: {method}',
            'tendered': 'Tendered: {amount}',
            'change': 'Change: {amount}',
        },
        'footer': {
            'thank_you': 'Thank You!',
            'visit_again': 'Please visit again',
            'powered_by': 'Powered by Ceybyte.com',
        }
    },
    
    'sinhala': {
        'header': {
            'business_name': '{business_name}',
            'address': '{address}',
            'phone': 'දුරකථන: {phone}',
            'email': 'ඊමේල්: {email}',
        },
        'receipt_info': {
            'number': 'රිසිට් අංකය: {receipt_no}',
            'date': 'දිනය: {date}',
            'cashier': 'අයකැමි: {cashier}',
        },
        'items_header': 'භාණඩ',
        'totals': {
            'subtotal': 'උප එකතුව:',
            'tax': 'බදු:',
            'discount': 'වට්ටම:',
            'total': 'මුළු එකතුව:',
        },
        'payment': {
            'method': 'ගෙවීම: {method}',
            'tendered': 'ලබා දුන්: {amount}',
            'change': 'ඉතිරිය: {amount}',
        },
        'footer': {
            'thank_you': 'ස්තූතියි!',
            'visit_again': 'නැවත පැමිණෙන්න',
            'powered_by': 'Ceybyte.com විසින් බලගන්වන ලදී',
        }
    },
    
    'tamil': {
        'header': {
            'business_name': '{business_name}',
            'address': '{address}',
            'phone': 'தொலைபேசி: {phone}',
            'email': 'மின்னஞ்சல்: {email}',
        },
        'receipt_info': {
            'number': 'ரசீது எண்: {receipt_no}',
            'date': 'தேதி: {date}',
            'cashier': 'காசாளர்: {cashier}',
        },
        'items_header': 'பொருட்கள்',
        'totals': {
            'subtotal': 'துணை மொத்தம்:',
            'tax': 'வரி:',
            'discount': 'தள்ளுபடி:',
            'total': 'மொத்தம்:',
        },
        'payment': {
            'method': 'கட்டணம்: {method}',
            'tendered': 'கொடுத்தது: {amount}',
            'change': 'மாற்றம்: {amount}',
        },
        'footer': {
            'thank_you': 'நன்றி!',
            'visit_again': 'மீண்டும் வருக',
            'powered_by': 'Ceybyte.com ஆல் இயக்கப்படுகிறது',
        }
    },
}

# Printer detection and auto-configuration
def detect_printer():
    """
    Detect connected thermal printers and return configuration
    
    Returns:
        dict: Printer configuration or None if not found
    """
    import usb.core
    
    for config_name, config in PRINTER_CONFIGS.items():
        try:
            device = usb.core.find(
                idVendor=config['vendor_id'],
                idProduct=config['product_id']
            )
            if device:
                return {
                    'name': config_name,
                    'config': config,
                    'device': device
                }
        except:
            continue
    
    return None

# Font and character set testing
def test_charset_support(printer, charset='CP437'):
    """
    Test if printer supports specific character set
    
    Args:
        printer: Printer instance
        charset: Character set to test
        
    Returns:
        bool: True if supported
    """
    try:
        # Test basic ASCII characters
        test_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()"
        
        printer.init()
        printer.charcode(PRINTER_CONFIGS['epson_tm_t20']['supported_charsets'].index(charset))
        printer.text(f"Testing {charset}: {test_chars}\n")
        printer.cut()
        
        return True
    except:
        return False