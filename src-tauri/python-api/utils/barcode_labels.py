"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  Barcode Label Printing                                          │
│                                                                                                  │
│  Description: Barcode and QR code label printing for products and inventory management          │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from typing import Dict, List, Any, Optional
import logging
from .printer_service import printer_service

logger = logging.getLogger(__name__)

class BarcodeLabelTemplate:
    """Barcode label template for product labels"""
    
    def __init__(self, paper_width: int = 80):
        self.paper_width = paper_width
        self.chars_per_line = 48 if paper_width == 80 else 32
    
    def center_text(self, text: str) -> str:
        """Center text within paper width"""
        return text.center(self.chars_per_line)
    
    def print_product_label(self, product_data: Dict[str, Any], copies: int = 1) -> bool:
        """Print product barcode label"""
        if not printer_service.is_connected():
            logger.error("No printer connected")
            return False
        
        try:
            for copy in range(copies):
                # Product name
                product_name = product_data.get('name', 'Unknown Product')
                if len(product_name) > self.chars_per_line:
                    product_name = product_name[:self.chars_per_line-3] + '...'
                
                printer_service.print_centered(product_name)
                
                # Price
                price = product_data.get('price', 0)
                price_text = f"Rs. {price:,.2f}"
                printer_service.print_centered(price_text)
                
                # Barcode
                barcode = product_data.get('barcode', '')
                if barcode:
                    # Print barcode using ESC/POS commands
                    printer_service.active_printer.barcode(barcode, 'CODE128', height=60, width=2, pos='BELOW')
                else:
                    printer_service.print_centered("No Barcode")
                
                # SKU
                sku = product_data.get('sku', '')
                if sku:
                    printer_service.print_centered(f"SKU: {sku}")
                
                printer_service.print_text('\n')
                
                # Cut paper between copies
                if copy < copies - 1:
                    printer_service.cut_paper()
            
            # Final cut
            printer_service.cut_paper()
            return True
            
        except Exception as e:
            logger.error(f"Barcode label printing error: {e}")
            return False
    
    def print_price_label(self, product_data: Dict[str, Any], copies: int = 1) -> bool:
        """Print simple price label without barcode"""
        if not printer_service.is_connected():
            logger.error("No printer connected")
            return False
        
        try:
            for copy in range(copies):
                # Product name in large font
                printer_service.active_printer.set(width=2, height=2, align='center')
                product_name = product_data.get('name', 'Unknown Product')
                if len(product_name) > 24:  # Adjust for large font
                    product_name = product_name[:21] + '...'
                printer_service.print_text(f"{product_name}\n")
                
                # Price in very large font
                printer_service.active_printer.set(width=3, height=3, align='center')
                price = product_data.get('price', 0)
                price_text = f"Rs. {price:,.2f}"
                printer_service.print_text(f"{price_text}\n")
                
                # Reset font
                printer_service.active_printer.set(width=1, height=1, align='center')
                
                # Unit if available
                unit = product_data.get('unit', '')
                if unit:
                    printer_service.print_text(f"per {unit}\n")
                
                printer_service.print_text('\n')
                
                # Cut paper between copies
                if copy < copies - 1:
                    printer_service.cut_paper()
            
            # Final cut
            printer_service.cut_paper()
            return True
            
        except Exception as e:
            logger.error(f"Price label printing error: {e}")
            return False
    
    def print_qr_label(self, data: str, title: str = "", copies: int = 1) -> bool:
        """Print QR code label"""
        if not printer_service.is_connected():
            logger.error("No printer connected")
            return False
        
        try:
            for copy in range(copies):
                # Title
                if title:
                    printer_service.print_centered(title)
                    printer_service.print_text('\n')
                
                # QR Code
                printer_service.active_printer.qr(data, size=6)
                printer_service.print_text('\n')
                
                # Data text (truncated if too long)
                if len(data) <= self.chars_per_line:
                    printer_service.print_centered(data)
                else:
                    printer_service.print_centered(data[:self.chars_per_line-3] + '...')
                
                printer_service.print_text('\n')
                
                # Cut paper between copies
                if copy < copies - 1:
                    printer_service.cut_paper()
            
            # Final cut
            printer_service.cut_paper()
            return True
            
        except Exception as e:
            logger.error(f"QR label printing error: {e}")
            return False

class BarcodeLabelManager:
    """Manager for barcode label printing"""
    
    def __init__(self):
        self.template = BarcodeLabelTemplate()
    
    def print_product_labels(self, products: List[Dict[str, Any]], copies: int = 1) -> Dict[str, Any]:
        """Print labels for multiple products"""
        results = {
            'success': True,
            'printed': 0,
            'failed': 0,
            'errors': []
        }
        
        for product in products:
            try:
                if self.template.print_product_label(product, copies):
                    results['printed'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append(f"Failed to print label for {product.get('name', 'Unknown')}")
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Error printing {product.get('name', 'Unknown')}: {str(e)}")
        
        if results['failed'] > 0:
            results['success'] = False
        
        return results
    
    def print_price_labels(self, products: List[Dict[str, Any]], copies: int = 1) -> Dict[str, Any]:
        """Print price labels for multiple products"""
        results = {
            'success': True,
            'printed': 0,
            'failed': 0,
            'errors': []
        }
        
        for product in products:
            try:
                if self.template.print_price_label(product, copies):
                    results['printed'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append(f"Failed to print price label for {product.get('name', 'Unknown')}")
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Error printing price label for {product.get('name', 'Unknown')}: {str(e)}")
        
        if results['failed'] > 0:
            results['success'] = False
        
        return results
    
    def print_qr_labels(self, qr_data: List[Dict[str, str]], copies: int = 1) -> Dict[str, Any]:
        """Print QR code labels"""
        results = {
            'success': True,
            'printed': 0,
            'failed': 0,
            'errors': []
        }
        
        for item in qr_data:
            try:
                data = item.get('data', '')
                title = item.get('title', '')
                
                if self.template.print_qr_label(data, title, copies):
                    results['printed'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append(f"Failed to print QR label: {title}")
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Error printing QR label: {str(e)}")
        
        if results['failed'] > 0:
            results['success'] = False
        
        return results

# Global barcode label manager instance
barcode_manager = BarcodeLabelManager()