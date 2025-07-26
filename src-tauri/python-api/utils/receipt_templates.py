"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  Receipt Template System                                         │
│                                                                                                  │
│  Description: Multi-language receipt templates with ESC/POS formatting and transliteration     │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from utils.printer_service import printer_service

logger = logging.getLogger(__name__)

class ReceiptTemplate:
    """Base receipt template class"""
    
    def __init__(self, language: str = 'en', paper_width: int = 80):
        self.language = language
        self.paper_width = paper_width
        self.chars_per_line = 48 if paper_width == 80 else 32
        
        # Language-specific settings
        self.currency_symbols = {
            'en': 'Rs.',
            'si': 'රු.',
            'ta': 'ரூ.'
        }
        
        # Common translations
        self.translations = {
            'en': {
                'receipt': 'RECEIPT',
                'invoice': 'INVOICE',
                'date': 'Date',
                'time': 'Time',
                'cashier': 'Cashier',
                'customer': 'Customer',
                'item': 'Item',
                'qty': 'Qty',
                'price': 'Price',
                'total': 'Total',
                'subtotal': 'Subtotal',
                'discount': 'Discount',
                'tax': 'Tax',
                'grand_total': 'Grand Total',
                'payment_method': 'Payment',
                'cash': 'Cash',
                'card': 'Card',
                'mobile': 'Mobile',
                'credit': 'Credit',
                'change': 'Change',
                'thank_you': 'Thank You!',
                'visit_again': 'Please visit again',
                'powered_by': 'Powered by CeybytePOS'
            },
            'si': {
                'receipt': 'බිල්පත',
                'invoice': 'ඉන්වොයිසය',
                'date': 'දිනය',
                'time': 'වේලාව',
                'cashier': 'අයකැමි',
                'customer': 'ගනුදෙනුකරු',
                'item': 'භාණ්ඩය',
                'qty': 'ප්‍රමාණය',
                'price': 'මිල',
                'total': 'එකතුව',
                'subtotal': 'උප එකතුව',
                'discount': 'වට්ටම',
                'tax': 'බදු',
                'grand_total': 'මුළු එකතුව',
                'payment_method': 'ගෙවීම',
                'cash': 'මුදල්',
                'card': 'කාඩ්',
                'mobile': 'ජංගම',
                'credit': 'ණය',
                'change': 'ඉතිරිය',
                'thank_you': 'ස්තූතියි!',
                'visit_again': 'නැවත පැමිණෙන්න',
                'powered_by': 'CeybytePOS මගින්'
            },
            'ta': {
                'receipt': 'ரசீது',
                'invoice': 'விலைப்பட்டியல்',
                'date': 'தேதி',
                'time': 'நேரம்',
                'cashier': 'காசாளர்',
                'customer': 'வாடிக்கையாளர்',
                'item': 'பொருள்',
                'qty': 'அளவு',
                'price': 'விலை',
                'total': 'மொத்தம்',
                'subtotal': 'துணை மொத்தம்',
                'discount': 'தள்ளுபடி',
                'tax': 'வரி',
                'grand_total': 'பெரும் மொத்தம்',
                'payment_method': 'பணம்',
                'cash': 'பணம்',
                'card': 'அட்டை',
                'mobile': 'மொபைல்',
                'credit': 'கடன்',
                'change': 'மாற்று',
                'thank_you': 'நன்றி!',
                'visit_again': 'மீண்டும் வாருங்கள்',
                'powered_by': 'CeybytePOS மூலம்'
            }
        }
    
    def get_text(self, key: str) -> str:
        """Get translated text for current language"""
        return self.translations.get(self.language, self.translations['en']).get(key, key)
    
    def get_currency_symbol(self) -> str:
        """Get currency symbol for current language"""
        return self.currency_symbols.get(self.language, 'Rs.')
    
    def format_currency(self, amount: float) -> str:
        """Format currency amount with proper symbol"""
        symbol = self.get_currency_symbol()
        return f"{symbol} {amount:,.2f}"
    
    def center_text(self, text: str) -> str:
        """Center text within paper width"""
        return text.center(self.chars_per_line)
    
    def left_right_text(self, left: str, right: str) -> str:
        """Format text with left and right alignment"""
        available_space = self.chars_per_line - len(left) - len(right)
        if available_space > 0:
            return left + ' ' * available_space + right
        else:
            # Truncate if too long
            max_left = self.chars_per_line - len(right) - 1
            return left[:max_left] + ' ' + right
    
    def line_separator(self, char: str = '-') -> str:
        """Create line separator"""
        return char * self.chars_per_line
    
    def transliterate_sinhala(self, text: str) -> str:
        """Basic Sinhala to ASCII transliteration for thermal printing"""
        # This is a simplified transliteration - in production, use a proper library
        sinhala_map = {
            'අ': 'a', 'ආ': 'aa', 'ඇ': 'ae', 'ඈ': 'aae', 'ඉ': 'i', 'ඊ': 'ii',
            'උ': 'u', 'ඌ': 'uu', 'ඍ': 'r', 'ඎ': 'rr', 'ඏ': 'l', 'ඐ': 'll',
            'එ': 'e', 'ඒ': 'ee', 'ඓ': 'ai', 'ඔ': 'o', 'ඕ': 'oo', 'ඖ': 'au',
            'ක': 'ka', 'ඛ': 'kha', 'ග': 'ga', 'ඝ': 'gha', 'ඞ': 'nga',
            'ච': 'cha', 'ඡ': 'chha', 'ජ': 'ja', 'ඣ': 'jha', 'ඤ': 'nya',
            'ට': 'ta', 'ඨ': 'tha', 'ඩ': 'da', 'ඪ': 'dha', 'ණ': 'na',
            'ත': 'tha', 'ථ': 'thha', 'ද': 'da', 'ධ': 'dha', 'න': 'na',
            'ප': 'pa', 'ඵ': 'pha', 'බ': 'ba', 'භ': 'bha', 'ම': 'ma',
            'ය': 'ya', 'ර': 'ra', 'ල': 'la', 'ව': 'wa', 'ශ': 'sha',
            'ෂ': 'sha', 'ස': 'sa', 'හ': 'ha', 'ළ': 'la', 'ෆ': 'fa'
        }
        
        result = ""
        for char in text:
            result += sinhala_map.get(char, char)
        return result
    
    def transliterate_tamil(self, text: str) -> str:
        """Basic Tamil to ASCII transliteration for thermal printing"""
        # This is a simplified transliteration - in production, use a proper library
        tamil_map = {
            'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ii', 'உ': 'u', 'ஊ': 'uu',
            'எ': 'e', 'ஏ': 'ee', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oo', 'ஔ': 'au',
            'க': 'ka', 'ங': 'nga', 'ச': 'cha', 'ஞ': 'nya', 'ட': 'ta', 'ண': 'na',
            'த': 'tha', 'ந': 'na', 'ப': 'pa', 'ம': 'ma', 'ய': 'ya', 'ர': 'ra',
            'ல': 'la', 'வ': 'va', 'ழ': 'zha', 'ள': 'la', 'ற': 'ra', 'ன': 'na'
        }
        
        result = ""
        for char in text:
            result += tamil_map.get(char, char)
        return result
    
    def process_text_for_printing(self, text: str) -> str:
        """Process text for thermal printer compatibility"""
        if self.language == 'si':
            return self.transliterate_sinhala(text)
        elif self.language == 'ta':
            return self.transliterate_tamil(text)
        else:
            return text

class SalesReceiptTemplate(ReceiptTemplate):
    """Sales receipt template"""
    
    def generate(self, sale_data: Dict[str, Any], business_info: Dict[str, Any]) -> str:
        """Generate sales receipt"""
        receipt_lines = []
        
        # Header
        receipt_lines.append(self.center_text(business_info.get('name', 'CeybytePOS')))
        if business_info.get('address'):
            receipt_lines.append(self.center_text(business_info['address']))
        if business_info.get('phone'):
            receipt_lines.append(self.center_text(f"Tel: {business_info['phone']}"))
        
        receipt_lines.append(self.line_separator('='))
        receipt_lines.append(self.center_text(self.get_text('receipt')))
        receipt_lines.append(self.line_separator('='))
        
        # Sale info
        receipt_lines.append(f"{self.get_text('date')}: {sale_data.get('date', datetime.now().strftime('%Y-%m-%d'))}")
        receipt_lines.append(f"{self.get_text('time')}: {sale_data.get('time', datetime.now().strftime('%H:%M:%S'))}")
        receipt_lines.append(f"{self.get_text('cashier')}: {sale_data.get('cashier', 'System')}")
        
        if sale_data.get('customer') and sale_data['customer'] != 'Walk-in Customer':
            receipt_lines.append(f"{self.get_text('customer')}: {sale_data['customer']}")
        
        receipt_lines.append(self.line_separator('-'))
        
        # Items header
        receipt_lines.append(self.left_right_text(
            f"{self.get_text('item')} ({self.get_text('qty')})",
            self.get_text('total')
        ))
        receipt_lines.append(self.line_separator('-'))
        
        # Items
        subtotal = 0
        for item in sale_data.get('items', []):
            item_name = self.process_text_for_printing(item.get('name', ''))
            quantity = item.get('quantity', 1)
            price = item.get('price', 0)
            item_total = quantity * price
            subtotal += item_total
            
            # Item line
            receipt_lines.append(f"{item_name} ({quantity})")
            receipt_lines.append(self.left_right_text(
                f"  {self.format_currency(price)} x {quantity}",
                self.format_currency(item_total)
            ))
        
        receipt_lines.append(self.line_separator('-'))
        
        # Totals
        receipt_lines.append(self.left_right_text(
            self.get_text('subtotal'),
            self.format_currency(subtotal)
        ))
        
        discount = sale_data.get('discount', 0)
        if discount > 0:
            receipt_lines.append(self.left_right_text(
                self.get_text('discount'),
                f"-{self.format_currency(discount)}"
            ))
        
        tax = sale_data.get('tax', 0)
        if tax > 0:
            receipt_lines.append(self.left_right_text(
                self.get_text('tax'),
                self.format_currency(tax)
            ))
        
        grand_total = subtotal - discount + tax
        receipt_lines.append(self.line_separator('='))
        receipt_lines.append(self.left_right_text(
            self.get_text('grand_total'),
            self.format_currency(grand_total)
        ))
        receipt_lines.append(self.line_separator('='))
        
        # Payment info
        payment_method = sale_data.get('payment_method', 'cash')
        payment_text = self.get_text(payment_method)
        receipt_lines.append(self.left_right_text(
            f"{self.get_text('payment_method')}: {payment_text}",
            self.format_currency(sale_data.get('amount_paid', grand_total))
        ))
        
        if payment_method == 'cash':
            change = sale_data.get('change', 0)
            if change > 0:
                receipt_lines.append(self.left_right_text(
                    self.get_text('change'),
                    self.format_currency(change)
                ))
        
        # Footer
        receipt_lines.append('')
        receipt_lines.append(self.center_text(self.get_text('thank_you')))
        receipt_lines.append(self.center_text(self.get_text('visit_again')))
        receipt_lines.append('')
        receipt_lines.append(self.center_text(self.get_text('powered_by')))
        receipt_lines.append('')
        
        return '\n'.join(receipt_lines)
    
    def print_receipt(self, sale_data: Dict[str, Any], business_info: Dict[str, Any]) -> bool:
        """Print sales receipt directly"""
        if not printer_service.is_connected():
            logger.error("No printer connected")
            return False
        
        try:
            receipt_content = self.generate(sale_data, business_info)
            
            # Print receipt
            printer_service.print_text(receipt_content)
            printer_service.cut_paper()
            
            return True
            
        except Exception as e:
            logger.error(f"Receipt printing error: {e}")
            return False

class ReceiptTemplateManager:
    """Manager for receipt templates"""
    
    def __init__(self):
        self.templates = {
            'sales_receipt': SalesReceiptTemplate
        }
    
    def get_template(self, template_type: str, language: str = 'en', paper_width: int = 80):
        """Get receipt template instance"""
        template_class = self.templates.get(template_type)
        if not template_class:
            raise ValueError(f"Unknown template type: {template_type}")
        
        return template_class(language=language, paper_width=paper_width)
    
    def print_sales_receipt(self, sale_data: Dict[str, Any], business_info: Dict[str, Any], 
                           language: str = 'en', paper_width: int = 80) -> bool:
        """Print sales receipt with specified language and paper width"""
        try:
            template = self.get_template('sales_receipt', language, paper_width)
            return template.print_receipt(sale_data, business_info)
        except Exception as e:
            logger.error(f"Print sales receipt error: {e}")
            return False

def format_receipt_for_whatsapp(sale) -> str:
    """Format receipt for WhatsApp sharing (text-only)"""
    try:
        # Business info (you might want to get this from settings)
        business_name = "CeybytePOS"
        business_phone = ""
        
        # Format receipt text
        receipt_text = f"*{business_name}*\n"
        if business_phone:
            receipt_text += f"Phone: {business_phone}\n"
        receipt_text += f"{'='*30}\n"
        receipt_text += f"Date: {sale.sale_date.strftime('%Y-%m-%d %H:%M')}\n"
        receipt_text += f"Receipt: #{sale.sale_number}\n"
        
        if sale.customer:
            receipt_text += f"Customer: {sale.customer.name}\n"
        
        receipt_text += f"{'='*30}\n"
        
        # Items
        receipt_text += f"*Items:*\n"
        for item in sale.sale_items:
            product_name = item.product.name if item.product else f"Product #{item.product_id}"
            receipt_text += f"• {product_name}\n"
            receipt_text += f"  {item.quantity} x Rs. {item.unit_price:,.2f} = Rs. {item.line_total:,.2f}\n"
        
        receipt_text += f"{'-'*30}\n"
        
        # Totals
        receipt_text += f"Subtotal: Rs. {sale.subtotal:,.2f}\n"
        
        if sale.discount_amount > 0:
            receipt_text += f"Discount: -Rs. {sale.discount_amount:,.2f}\n"
        
        if sale.tax_amount > 0:
            receipt_text += f"Tax: Rs. {sale.tax_amount:,.2f}\n"
        
        receipt_text += f"{'='*30}\n"
        receipt_text += f"*Total: Rs. {sale.total_amount:,.2f}*\n"
        receipt_text += f"{'='*30}\n"
        
        # Payment info
        payment_method_text = {
            'cash': 'Cash',
            'card': 'Card',
            'mobile': 'Mobile Money',
            'credit': 'Credit'
        }.get(sale.payment_method, sale.payment_method.title())
        
        receipt_text += f"Payment: {payment_method_text}\n"
        receipt_text += f"Paid: Rs. {sale.amount_paid:,.2f}\n"
        
        if sale.payment_method == 'cash' and sale.change_amount > 0:
            receipt_text += f"Change: Rs. {sale.change_amount:,.2f}\n"
        
        if sale.is_credit_sale and sale.credit_balance > 0:
            receipt_text += f"Credit Balance: Rs. {sale.credit_balance:,.2f}\n"
        
        receipt_text += f"\nThank you for your business!\n"
        receipt_text += f"Please visit again\n\n"
        receipt_text += f"Powered by CeybytePOS"
        
        return receipt_text
        
    except Exception as e:
        logger.error(f"Error formatting WhatsApp receipt: {e}")
        return f"Receipt for Sale #{sale.sale_number if sale else 'Unknown'}\nError formatting receipt details."

# Global template manager instance
receipt_manager = ReceiptTemplateManager()