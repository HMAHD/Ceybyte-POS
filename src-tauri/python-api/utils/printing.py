"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                  Thermal Printing Utilities                                      ║
║                                                                                                  ║
║  Description: Comprehensive thermal printing system with multi-language support.                 ║
║               Handles character encoding, font fallbacks, and receipt formatting.                ║
║                                                                                                  ║
║  Author: Akash Hasendra                                                                          ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

import unicodedata
from typing import Dict, List, Optional, Tuple
from escpos.printer import Usb, Serial, Network, File
from escpos.constants import *
import logging

logger = logging.getLogger(__name__)

class PrinterConfig:
    """Configuration for thermal printer settings"""
    
    # Common thermal printer character sets
    CHARSET_ENCODINGS = {
        'CP437': 0,      # Default - English, basic symbols
        'CP850': 2,      # Western European
        'CP860': 3,      # Portuguese
        'CP863': 4,      # French Canadian
        'CP865': 5,      # Nordic
        'ISO8859-1': 6,  # Latin-1
        'ISO8859-2': 7,  # Latin-2
        'CP1252': 16,    # Windows Latin-1
    }
    
    # Fallback character mappings for unsupported characters
    CHAR_FALLBACKS = {
        # Sinhala characters to closest ASCII/Latin equivalents
        'අ': 'a', 'ආ': 'aa', 'ඇ': 'ae', 'ඈ': 'aae',
        'ඉ': 'i', 'ඊ': 'ii', 'උ': 'u', 'ඌ': 'uu',
        'එ': 'e', 'ඒ': 'ee', 'ඔ': 'o', 'ඕ': 'oo',
        'ක': 'ka', 'ග': 'ga', 'ච': 'cha', 'ජ': 'ja',
        'ට': 'ta', 'ඩ': 'da', 'ත': 'tha', 'ද': 'dha',
        'න': 'na', 'ප': 'pa', 'බ': 'ba', 'ම': 'ma',
        'ය': 'ya', 'ර': 'ra', 'ල': 'la', 'ව': 'wa',
        'ස': 'sa', 'හ': 'ha', 'ළ': 'lla', 'ෆ': 'fa',
        
        # Tamil characters to closest ASCII/Latin equivalents
        'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ii',
        'உ': 'u', 'ஊ': 'uu', 'எ': 'e', 'ஏ': 'ee',
        'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oo', 'ஔ': 'au',
        'க': 'ka', 'ங': 'nga', 'ச': 'cha', 'ஞ': 'nya',
        'ட': 'ta', 'ண': 'na', 'த': 'tha', 'ந': 'nha',
        'ப': 'pa', 'ம': 'ma', 'ய': 'ya', 'ர': 'ra',
        'ல': 'la', 'வ': 'va', 'ழ': 'zha', 'ள': 'lla',
        'ற': 'rra', 'ன': 'nna', 'ஜ': 'ja', 'ஸ': 'sa',
        'ஷ': 'sha', 'ஹ': 'ha',
        
        # Currency and common symbols
        '₹': 'Rs.', '€': 'EUR', '£': 'GBP', '¥': 'JPY',
        '°': 'deg', '±': '+/-', '×': 'x', '÷': '/',
        
        # Common punctuation fallbacks
        '"': '"', '"': '"', ''': "'", ''': "'",
        '–': '-', '—': '--', '…': '...',
    }

class ThermalPrinter:
    """Enhanced thermal printer with multi-language support"""
    
    def __init__(self, printer_type: str = 'usb', **kwargs):
        """
        Initialize thermal printer
        
        Args:
            printer_type: 'usb', 'serial', 'network', or 'file'
            **kwargs: Printer-specific connection parameters
        """
        self.printer = None
        self.config = PrinterConfig()
        self.current_charset = 'CP437'  # Default charset
        
        try:
            if printer_type == 'usb':
                # Common USB thermal printer vendor/product IDs
                vendor_id = kwargs.get('vendor_id', 0x04b8)  # Epson
                product_id = kwargs.get('product_id', 0x0202)
                self.printer = Usb(vendor_id, product_id)
                
            elif printer_type == 'serial':
                port = kwargs.get('port', 'COM1')
                baudrate = kwargs.get('baudrate', 9600)
                self.printer = Serial(port, baudrate)
                
            elif printer_type == 'network':
                host = kwargs.get('host', '192.168.1.100')
                port = kwargs.get('port', 9100)
                self.printer = Network(host, port)
                
            elif printer_type == 'file':
                # For testing - prints to file
                filename = kwargs.get('filename', 'receipt.txt')
                self.printer = File(filename)
                
            logger.info(f"Thermal printer initialized: {printer_type}")
            
        except Exception as e:
            logger.error(f"Failed to initialize printer: {e}")
            raise
    
    def set_charset(self, charset: str = 'CP437'):
        """Set printer character set"""
        if charset in self.config.CHARSET_ENCODINGS:
            charset_id = self.config.CHARSET_ENCODINGS[charset]
            self.printer.charcode(charset_id)
            self.current_charset = charset
            logger.info(f"Charset set to: {charset}")
        else:
            logger.warning(f"Unsupported charset: {charset}")
    
    def transliterate_text(self, text: str) -> str:
        """
        Convert non-ASCII characters to ASCII equivalents
        
        Args:
            text: Input text with potential Unicode characters
            
        Returns:
            ASCII-compatible text
        """
        result = []
        
        for char in text:
            # Check if character is in our fallback mapping
            if char in self.config.CHAR_FALLBACKS:
                result.append(self.config.CHAR_FALLBACKS[char])
            # Check if character is ASCII
            elif ord(char) < 128:
                result.append(char)
            else:
                # Try to get ASCII equivalent using Unicode normalization
                try:
                    normalized = unicodedata.normalize('NFKD', char)
                    ascii_char = normalized.encode('ascii', 'ignore').decode('ascii')
                    if ascii_char:
                        result.append(ascii_char)
                    else:
                        # Last resort: use character name or placeholder
                        char_name = unicodedata.name(char, '?')
                        if len(char_name) == 1:
                            result.append(char_name)
                        else:
                            result.append('?')
                except:
                    result.append('?')
        
        return ''.join(result)
    
    def format_currency(self, amount: float, currency: str = 'LKR') -> str:
        """Format currency for thermal printing"""
        if currency == 'LKR':
            return f"Rs. {amount:,.2f}"
        else:
            return f"{currency} {amount:,.2f}"
    
    def print_receipt(self, receipt_data: Dict) -> bool:
        """
        Print a complete receipt with multi-language support
        
        Args:
            receipt_data: Dictionary containing receipt information
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Initialize printer
            self.printer.init()
            self.set_charset('CP437')  # Use most compatible charset
            
            # Header
            if 'business_name' in receipt_data:
                business_name = self.transliterate_text(receipt_data['business_name'])
                self.printer.set(align='center', text_type='B', width=2, height=2)
                self.printer.text(f"{business_name}\n")
            
            if 'business_address' in receipt_data:
                address = self.transliterate_text(receipt_data['business_address'])
                self.printer.set(align='center', text_type='normal')
                self.printer.text(f"{address}\n")
            
            if 'business_phone' in receipt_data:
                self.printer.text(f"Tel: {receipt_data['business_phone']}\n")
            
            # Separator
            self.printer.text("=" * 32 + "\n")
            
            # Receipt details
            if 'receipt_number' in receipt_data:
                self.printer.set(align='center', text_type='B')
                self.printer.text(f"Receipt No: {receipt_data['receipt_number']}\n")
            
            if 'date_time' in receipt_data:
                self.printer.set(align='center', text_type='normal')
                self.printer.text(f"{receipt_data['date_time']}\n")
            
            self.printer.text("-" * 32 + "\n")
            
            # Items
            if 'items' in receipt_data:
                self.printer.set(align='left', text_type='normal')
                for item in receipt_data['items']:
                    item_name = self.transliterate_text(item.get('name', ''))
                    quantity = item.get('quantity', 1)
                    price = item.get('price', 0.0)
                    total = quantity * price
                    
                    # Item name
                    self.printer.text(f"{item_name}\n")
                    
                    # Quantity and price on same line
                    qty_price_line = f"  {quantity} x {self.format_currency(price)}"
                    total_str = self.format_currency(total)
                    
                    # Right-align total
                    spaces_needed = 32 - len(qty_price_line) - len(total_str)
                    if spaces_needed > 0:
                        qty_price_line += " " * spaces_needed + total_str
                    else:
                        qty_price_line += " " + total_str
                    
                    self.printer.text(f"{qty_price_line}\n")
            
            # Totals
            self.printer.text("-" * 32 + "\n")
            
            if 'subtotal' in receipt_data:
                subtotal_line = f"Subtotal:"
                subtotal_str = self.format_currency(receipt_data['subtotal'])
                spaces = 32 - len(subtotal_line) - len(subtotal_str)
                self.printer.text(f"{subtotal_line}{' ' * spaces}{subtotal_str}\n")
            
            if 'tax' in receipt_data and receipt_data['tax'] > 0:
                tax_line = f"Tax:"
                tax_str = self.format_currency(receipt_data['tax'])
                spaces = 32 - len(tax_line) - len(tax_str)
                self.printer.text(f"{tax_line}{' ' * spaces}{tax_str}\n")
            
            if 'discount' in receipt_data and receipt_data['discount'] > 0:
                discount_line = f"Discount:"
                discount_str = self.format_currency(receipt_data['discount'])
                spaces = 32 - len(discount_line) - len(discount_str)
                self.printer.text(f"{discount_line}{' ' * spaces}{discount_str}\n")
            
            if 'total' in receipt_data:
                self.printer.set(text_type='B')
                total_line = f"TOTAL:"
                total_str = self.format_currency(receipt_data['total'])
                spaces = 32 - len(total_line) - len(total_str)
                self.printer.text(f"{total_line}{' ' * spaces}{total_str}\n")
            
            # Payment info
            if 'payment_method' in receipt_data:
                self.printer.set(text_type='normal')
                payment_method = self.transliterate_text(receipt_data['payment_method'])
                self.printer.text(f"Payment: {payment_method}\n")
            
            if 'change' in receipt_data and receipt_data['change'] > 0:
                change_str = self.format_currency(receipt_data['change'])
                self.printer.text(f"Change: {change_str}\n")
            
            # Footer
            self.printer.text("=" * 32 + "\n")
            
            if 'footer_message' in receipt_data:
                footer = self.transliterate_text(receipt_data['footer_message'])
                self.printer.set(align='center', text_type='normal')
                self.printer.text(f"{footer}\n")
            
            # Ceybyte branding
            self.printer.set(align='center', text_type='normal')
            self.printer.text("Powered by Ceybyte.com\n")
            
            # Cut paper
            self.printer.cut()
            
            logger.info("Receipt printed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to print receipt: {e}")
            return False
    
    def test_print(self) -> bool:
        """Test printer with multi-language sample"""
        test_data = {
            'business_name': 'සාම්පල් ශොප් / Sample Shop',
            'business_address': 'කොළඹ, ශ්‍රී ලංකාව / Colombo, Sri Lanka',
            'business_phone': '+94 11 234 5678',
            'receipt_number': 'R001',
            'date_time': '2025-01-22 10:30 AM',
            'items': [
                {'name': 'බත් / Rice', 'quantity': 2, 'price': 150.00},
                {'name': 'කිරි / Milk', 'quantity': 1, 'price': 200.00},
            ],
            'subtotal': 500.00,
            'tax': 75.00,
            'total': 575.00,
            'payment_method': 'මුදල් / Cash',
            'footer_message': 'ස්තූතියි! / Thank You!'
        }
        
        return self.print_receipt(test_data)
    
    def close(self):
        """Close printer connection"""
        if self.printer:
            try:
                self.printer.close()
                logger.info("Printer connection closed")
            except:
                pass

# Utility functions for receipt formatting
def format_receipt_line(left_text: str, right_text: str, width: int = 32) -> str:
    """Format a line with left and right aligned text"""
    left_text = left_text[:width-len(right_text)-1]  # Ensure it fits
    spaces_needed = width - len(left_text) - len(right_text)
    return f"{left_text}{' ' * max(1, spaces_needed)}{right_text}"

def wrap_text(text: str, width: int = 32) -> List[str]:
    """Wrap text to fit printer width"""
    words = text.split()
    lines = []
    current_line = ""
    
    for word in words:
        if len(current_line + " " + word) <= width:
            if current_line:
                current_line += " " + word
            else:
                current_line = word
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    
    if current_line:
        lines.append(current_line)
    
    return lines