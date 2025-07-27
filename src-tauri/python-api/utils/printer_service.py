"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                  Thermal Printer Service                                         │
│                                                                                                  │
│  Description: ESC/POS thermal printer communication service with multi-language support         │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import logging
from typing import Optional, Dict, Any, List
from escpos.printer import Usb, Serial, Network, File
from escpos.exceptions import USBNotFoundError
from serial import SerialException
import usb.core
import serial.tools.list_ports
from models.printer import Printer

logger = logging.getLogger(__name__)

class PrinterService:
    """Service for managing thermal printer communication"""
    
    def __init__(self):
        self.active_printer: Optional[Any] = None
        self.printer_config: Optional[Dict[str, Any]] = None
        
    def discover_usb_printers(self) -> List[Dict[str, Any]]:
        """Discover available USB thermal printers"""
        printers = []
        
        try:
            # Common thermal printer vendor/product IDs
            thermal_printer_ids = [
                {'vendor': 0x04b8, 'product': 0x0202},  # Epson TM-T20
                {'vendor': 0x04b8, 'product': 0x0e15},  # Epson TM-T82
                {'vendor': 0x0519, 'product': 0x0003},  # Generic thermal
                {'vendor': 0x1fc9, 'product': 0x2016},  # POS-80 series
            ]
            
            devices = usb.core.find(find_all=True)
            for device in devices:
                for printer_id in thermal_printer_ids:
                    if (device.idVendor == printer_id['vendor'] and 
                        device.idProduct == printer_id['product']):
                        printers.append({
                            'type': 'usb',
                            'vendor_id': device.idVendor,
                            'product_id': device.idProduct,
                            'name': f"USB Printer {device.idVendor:04x}:{device.idProduct:04x}",
                            'port': f"{device.idVendor:04x}:{device.idProduct:04x}"
                        })
                        
        except Exception as e:
            logger.error(f"Error discovering USB printers: {e}")
            
        return printers
    
    def discover_serial_printers(self) -> List[Dict[str, Any]]:
        """Discover available serial port printers"""
        printers = []
        
        try:
            ports = serial.tools.list_ports.comports()
            for port in ports:
                printers.append({
                    'type': 'serial',
                    'name': f"Serial Port {port.device}",
                    'port': port.device,
                    'description': port.description or 'Unknown'
                })
                
        except Exception as e:
            logger.error(f"Error discovering serial printers: {e}")
            
        return printers
    
    def connect_printer(self, printer_config: Dict[str, Any]) -> bool:
        """Connect to a thermal printer"""
        try:
            printer_type = printer_config.get('type')
            
            if printer_type == 'usb':
                vendor_id = int(printer_config['vendor_id'])
                product_id = int(printer_config['product_id'])
                self.active_printer = Usb(vendor_id, product_id)
                
            elif printer_type == 'serial':
                port = printer_config['port']
                baudrate = printer_config.get('baudrate', 9600)
                self.active_printer = Serial(port, baudrate=baudrate)
                
            elif printer_type == 'network':
                host = printer_config['host']
                port = printer_config.get('port', 9100)
                self.active_printer = Network(host, port)
                
            else:
                logger.error(f"Unsupported printer type: {printer_type}")
                return False
                
            # Test connection
            self.active_printer.text("Connection Test\n")
            self.active_printer.cut()
            
            self.printer_config = printer_config
            logger.info(f"Connected to {printer_type} printer successfully")
            return True
            
        except (USBNotFoundError, SerialException) as e:
            logger.error(f"Printer connection error: {e}")
            self.active_printer = None
            return False
        except Exception as e:
            logger.error(f"Unexpected printer error: {e}")
            self.active_printer = None
            return False
    
    def disconnect_printer(self):
        """Disconnect from current printer"""
        if self.active_printer:
            try:
                self.active_printer.close()
            except Exception as e:
                logger.error(f"Error disconnecting printer: {e}")
            finally:
                self.active_printer = None
                self.printer_config = None
    
    def is_connected(self) -> bool:
        """Check if printer is connected"""
        return self.active_printer is not None
    
    def print_text(self, text: str, font_size: str = 'normal') -> bool:
        """Print plain text"""
        if not self.active_printer:
            logger.error("No printer connected")
            return False
            
        try:
            if font_size == 'large':
                self.active_printer.set(width=2, height=2)
            elif font_size == 'small':
                self.active_printer.set(width=1, height=1)
            else:
                self.active_printer.set(width=1, height=1)
                
            self.active_printer.text(text)
            return True
            
        except Exception as e:
            logger.error(f"Print text error: {e}")
            return False
    
    def print_line(self, char: str = '-', length: int = 32) -> bool:
        """Print a line separator"""
        if not self.active_printer:
            return False
            
        try:
            line = char * length + '\n'
            self.active_printer.text(line)
            return True
        except Exception as e:
            logger.error(f"Print line error: {e}")
            return False
    
    def print_centered(self, text: str, width: int = 32) -> bool:
        """Print centered text"""
        if not self.active_printer:
            return False
            
        try:
            centered_text = text.center(width) + '\n'
            self.active_printer.text(centered_text)
            return True
        except Exception as e:
            logger.error(f"Print centered error: {e}")
            return False
    
    def print_receipt_header(self, business_name: str, address: str = "", phone: str = "") -> bool:
        """Print receipt header with business info"""
        if not self.active_printer:
            return False
            
        try:
            # Business name in large font
            self.active_printer.set(width=2, height=2, align='center')
            self.active_printer.text(f"{business_name}\n")
            
            # Reset to normal font
            self.active_printer.set(width=1, height=1, align='center')
            
            if address:
                self.active_printer.text(f"{address}\n")
            if phone:
                self.active_printer.text(f"Tel: {phone}\n")
                
            self.print_line('=', 32)
            return True
            
        except Exception as e:
            logger.error(f"Print header error: {e}")
            return False
    
    def print_receipt_footer(self, thank_you_msg: str = "Thank You!") -> bool:
        """Print receipt footer"""
        if not self.active_printer:
            return False
            
        try:
            self.print_line('=', 32)
            self.print_centered(thank_you_msg)
            self.print_centered("Powered by CeybytePOS")
            self.active_printer.text('\n\n')
            return True
            
        except Exception as e:
            logger.error(f"Print footer error: {e}")
            return False
    
    def cut_paper(self) -> bool:
        """Cut the paper"""
        if not self.active_printer:
            return False
            
        try:
            self.active_printer.cut()
            return True
        except Exception as e:
            logger.error(f"Paper cut error: {e}")
            return False
    
    def open_cash_drawer(self) -> bool:
        """Open cash drawer if connected"""
        if not self.active_printer:
            return False
            
        try:
            # ESC/POS command to open cash drawer
            self.active_printer.cashdraw(2)
            return True
        except Exception as e:
            logger.error(f"Cash drawer error: {e}")
            return False

# Global printer service instance
printer_service = PrinterService()