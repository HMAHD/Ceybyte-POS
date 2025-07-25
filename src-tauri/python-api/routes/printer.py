"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   Printer API Routes                                             │
│                                                                                                  │
│  Description: FastAPI routes for thermal printer management and printing operations             │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                  │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
import logging

from database.connection import get_db
from models.printer import Printer, PrintJob, PrinterType, PrintJobStatus
from utils.printer_service_simple import printer_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/printer", tags=["printer"])

# Pydantic models for API
class PrinterConfigRequest(BaseModel):
    name: str
    printer_type: str
    connection_string: str
    paper_width: int = 80
    characters_per_line: int = 48
    is_default: bool = False

class PrintJobRequest(BaseModel):
    job_type: str
    content: str
    reference_id: str = None
    copies: int = 1
    priority: int = 5

class PrintTestRequest(BaseModel):
    printer_config: Dict[str, Any]

@router.get("/discover")
async def discover_printers():
    """Discover available thermal printers"""
    try:
        usb_printers = printer_service.discover_usb_printers()
        serial_printers = printer_service.discover_serial_printers()
        
        return {
            "success": True,
            "data": {
                "usb": usb_printers,
                "serial": serial_printers
            }
        }
    except Exception as e:
        logger.error(f"Printer discovery error: {e}")
        raise HTTPException(status_code=500, detail="Failed to discover printers")

@router.post("/test")
async def test_printer(request: PrintTestRequest):
    """Test printer connection and print test page"""
    try:
        # Convert string type to proper format for printer service
        config = request.printer_config.copy()
        if config.get('type') == 'usb':
            # Convert hex strings to integers for USB
            if isinstance(config.get('vendor_id'), str):
                config['vendor_id'] = int(config['vendor_id'], 16)
            if isinstance(config.get('product_id'), str):
                config['product_id'] = int(config['product_id'], 16)
        
        success = printer_service.connect_printer(config)
        
        if success:
            # Print test page
            printer_service.print_receipt_header("CeybytePOS", "Test Print", "")
            printer_service.print_centered("PRINTER TEST")
            printer_service.print_line('-', 32)
            printer_service.print_text("This is a test print to verify\n")
            printer_service.print_text("printer connectivity and\n")
            printer_service.print_text("functionality.\n")
            printer_service.print_line('-', 32)
            printer_service.print_text(f"Printer: {config.get('name', 'Unknown')}\n")
            printer_service.print_text(f"Type: {config.get('type', 'Unknown')}\n")
            printer_service.print_receipt_footer("Test Successful!")
            printer_service.cut_paper()
            printer_service.disconnect_printer()
            
            return {"success": True, "message": "Test print successful"}
        else:
            return {"success": False, "message": "Failed to connect to printer"}
            
    except Exception as e:
        logger.error(f"Printer test error: {e}")
        return {"success": False, "message": f"Test failed: {str(e)}"}

@router.get("/")
async def get_printers(db: Session = Depends(get_db)):
    """Get all configured printers"""
    try:
        printers = db.query(Printer).filter(Printer.is_active == True).all()
        return {
            "success": True,
            "data": [
                {
                    "id": p.id,
                    "name": p.name,
                    "type": p.printer_type.value,
                    "connection_string": p.connection_string,
                    "is_default": p.is_default,
                    "paper_width": p.paper_width,
                    "characters_per_line": p.characters_per_line,
                    "last_test_success": p.last_test_success
                }
                for p in printers
            ]
        }
    except Exception as e:
        logger.error(f"Get printers error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get printers")

@router.post("/")
async def create_printer(request: PrinterConfigRequest, db: Session = Depends(get_db)):
    """Create new printer configuration"""
    try:
        # If this is set as default, unset other defaults
        if request.is_default:
            db.query(Printer).update({"is_default": False})
        
        printer = Printer(
            name=request.name,
            printer_type=PrinterType(request.printer_type),
            connection_string=request.connection_string,
            paper_width=request.paper_width,
            characters_per_line=request.characters_per_line,
            is_default=request.is_default
        )
        
        db.add(printer)
        db.commit()
        db.refresh(printer)
        
        return {
            "success": True,
            "data": {
                "id": printer.id,
                "name": printer.name,
                "message": "Printer configured successfully"
            }
        }
        
    except Exception as e:
        logger.error(f"Create printer error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create printer")

@router.put("/{printer_id}")
async def update_printer(printer_id: int, request: PrinterConfigRequest, db: Session = Depends(get_db)):
    """Update printer configuration"""
    try:
        printer = db.query(Printer).filter(Printer.id == printer_id).first()
        if not printer:
            raise HTTPException(status_code=404, detail="Printer not found")
        
        # If this is set as default, unset other defaults
        if request.is_default:
            db.query(Printer).filter(Printer.id != printer_id).update({"is_default": False})
        
        printer.name = request.name
        printer.printer_type = PrinterType(request.printer_type)
        printer.connection_string = request.connection_string
        printer.paper_width = request.paper_width
        printer.characters_per_line = request.characters_per_line
        printer.is_default = request.is_default
        
        db.commit()
        
        return {"success": True, "message": "Printer updated successfully"}
        
    except Exception as e:
        logger.error(f"Update printer error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update printer")

@router.delete("/{printer_id}")
async def delete_printer(printer_id: int, db: Session = Depends(get_db)):
    """Delete printer configuration"""
    try:
        printer = db.query(Printer).filter(Printer.id == printer_id).first()
        if not printer:
            raise HTTPException(status_code=404, detail="Printer not found")
        
        printer.is_active = False
        db.commit()
        
        return {"success": True, "message": "Printer deleted successfully"}
        
    except Exception as e:
        logger.error(f"Delete printer error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete printer")

@router.post("/print")
async def print_job(request: PrintJobRequest, db: Session = Depends(get_db)):
    """Add print job to queue"""
    try:
        job = PrintJob(
            job_type=request.job_type,
            content=request.content,
            reference_id=request.reference_id,
            copies=request.copies,
            priority=request.priority
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Try to process immediately
        await process_print_queue(db)
        
        return {
            "success": True,
            "data": {"job_id": job.id},
            "message": "Print job queued successfully"
        }
        
    except Exception as e:
        logger.error(f"Print job error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to queue print job")

@router.get("/queue")
async def get_print_queue(db: Session = Depends(get_db)):
    """Get current print queue status"""
    try:
        jobs = db.query(PrintJob).filter(
            PrintJob.status.in_([PrintJobStatus.PENDING, PrintJobStatus.PRINTING])
        ).order_by(PrintJob.priority, PrintJob.created_at).all()
        
        return {
            "success": True,
            "data": [
                {
                    "id": job.id,
                    "job_type": job.job_type,
                    "reference_id": job.reference_id,
                    "status": job.status.value,
                    "copies": job.copies,
                    "priority": job.priority,
                    "retry_count": job.retry_count,
                    "created_at": job.created_at.isoformat() if job.created_at else None
                }
                for job in jobs
            ]
        }
        
    except Exception as e:
        logger.error(f"Get print queue error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get print queue")

async def process_print_queue(db: Session):
    """Process pending print jobs"""
    try:
        # Get default printer
        default_printer = db.query(Printer).filter(
            Printer.is_default == True,
            Printer.is_active == True
        ).first()
        
        if not default_printer:
            logger.warning("No default printer configured")
            return
        
        # Get pending jobs
        pending_jobs = db.query(PrintJob).filter(
            PrintJob.status == PrintJobStatus.PENDING
        ).order_by(PrintJob.priority, PrintJob.created_at).limit(5).all()
        
        if not pending_jobs:
            return
        
        # Connect to printer
        printer_config = {
            'type': default_printer.printer_type.value,
            'connection_string': default_printer.connection_string
        }
        
        # Parse connection string based on type
        if default_printer.printer_type == PrinterType.USB:
            # Format: "vendor_id:product_id"
            vendor_id, product_id = default_printer.connection_string.split(':')
            printer_config['vendor_id'] = int(vendor_id, 16)
            printer_config['product_id'] = int(product_id, 16)
        elif default_printer.printer_type == PrinterType.SERIAL:
            printer_config['port'] = default_printer.connection_string
        elif default_printer.printer_type == PrinterType.NETWORK:
            # Format: "host:port"
            host, port = default_printer.connection_string.split(':')
            printer_config['host'] = host
            printer_config['port'] = int(port)
        
        if not printer_service.connect_printer(printer_config):
            logger.error("Failed to connect to default printer")
            return
        
        # Process jobs
        for job in pending_jobs:
            try:
                job.status = PrintJobStatus.PRINTING
                db.commit()
                
                # Print content (simplified - would need proper template processing)
                for copy in range(job.copies):
                    printer_service.print_text(job.content)
                    printer_service.cut_paper()
                
                job.mark_completed()
                db.commit()
                
            except Exception as e:
                logger.error(f"Print job {job.id} failed: {e}")
                job.mark_failed(str(e))
                db.commit()
        
        printer_service.disconnect_printer()
        
    except Exception as e:
        logger.error(f"Process print queue error: {e}")

@router.post("/queue/process")
async def manual_process_queue(db: Session = Depends(get_db)):
    """Manually process print queue"""
    try:
        await process_print_queue(db)
        return {"success": True, "message": "Print queue processed"}
    except Exception as e:
        logger.error(f"Manual process queue error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process print queue")

class PrintReceiptRequest(BaseModel):
    sale_data: Dict[str, Any]
    business_info: Dict[str, Any] = {}
    language: str = "en"
    paper_width: int = 80

@router.post("/receipt")
async def print_receipt(request: PrintReceiptRequest, db: Session = Depends(get_db)):
    """Print sales receipt"""
    try:
        from utils.receipt_templates import receipt_manager
        
        # Get default printer
        default_printer = db.query(Printer).filter(
            Printer.is_default == True,
            Printer.is_active == True
        ).first()
        
        if not default_printer:
            return {"success": False, "message": "No default printer configured"}
        
        # Connect to printer
        printer_config = {
            'type': default_printer.printer_type.value,
            'connection_string': default_printer.connection_string
        }
        
        # Parse connection string based on type
        if default_printer.printer_type == PrinterType.USB:
            vendor_id, product_id = default_printer.connection_string.split(':')
            printer_config['vendor_id'] = int(vendor_id, 16)
            printer_config['product_id'] = int(product_id, 16)
        elif default_printer.printer_type == PrinterType.SERIAL:
            printer_config['port'] = default_printer.connection_string
        elif default_printer.printer_type == PrinterType.NETWORK:
            host, port = default_printer.connection_string.split(':')
            printer_config['host'] = host
            printer_config['port'] = int(port)
        
        if not printer_service.connect_printer(printer_config):
            return {"success": False, "message": "Failed to connect to printer"}
        
        # Print receipt
        success = receipt_manager.print_sales_receipt(
            request.sale_data,
            request.business_info,
            request.language,
            request.paper_width
        )
        
        printer_service.disconnect_printer()
        
        if success:
            return {"success": True, "message": "Receipt printed successfully"}
        else:
            return {"success": False, "message": "Failed to print receipt"}
            
    except Exception as e:
        logger.error(f"Print receipt error: {e}")
        return {"success": False, "message": f"Print error: {str(e)}"}

class PrintLabelsRequest(BaseModel):
    products: List[Dict[str, Any]]
    label_type: str = "barcode"  # barcode, price, qr
    copies: int = 1

@router.post("/labels")
async def print_labels(request: PrintLabelsRequest, db: Session = Depends(get_db)):
    """Print product labels (barcode, price, or QR)"""
    try:
        from ..utils.barcode_labels import barcode_manager
        
        # Get default printer
        default_printer = db.query(Printer).filter(
            Printer.is_default == True,
            Printer.is_active == True
        ).first()
        
        if not default_printer:
            return {"success": False, "message": "No default printer configured"}
        
        # Connect to printer
        printer_config = {
            'type': default_printer.printer_type.value,
            'connection_string': default_printer.connection_string
        }
        
        # Parse connection string based on type
        if default_printer.printer_type == PrinterType.USB:
            vendor_id, product_id = default_printer.connection_string.split(':')
            printer_config['vendor_id'] = int(vendor_id, 16)
            printer_config['product_id'] = int(product_id, 16)
        elif default_printer.printer_type == PrinterType.SERIAL:
            printer_config['port'] = default_printer.connection_string
        elif default_printer.printer_type == PrinterType.NETWORK:
            host, port = default_printer.connection_string.split(':')
            printer_config['host'] = host
            printer_config['port'] = int(port)
        
        if not printer_service.connect_printer(printer_config):
            return {"success": False, "message": "Failed to connect to printer"}
        
        # Print labels based on type
        if request.label_type == "barcode":
            results = barcode_manager.print_product_labels(request.products, request.copies)
        elif request.label_type == "price":
            results = barcode_manager.print_price_labels(request.products, request.copies)
        elif request.label_type == "qr":
            results = barcode_manager.print_qr_labels(request.products, request.copies)
        else:
            return {"success": False, "message": "Invalid label type"}
        
        printer_service.disconnect_printer()
        
        return {
            "success": results['success'],
            "message": f"Printed {results['printed']} labels, {results['failed']} failed",
            "data": results
        }
            
    except Exception as e:
        logger.error(f"Print labels error: {e}")
        return {"success": False, "message": f"Label print error: {str(e)}"}

class PrintQRRequest(BaseModel):
    data: str
    title: str = ""
    copies: int = 1

@router.post("/qr")
async def print_qr_code(request: PrintQRRequest, db: Session = Depends(get_db)):
    """Print single QR code label"""
    try:
        from ..utils.barcode_labels import barcode_manager
        
        # Get default printer
        default_printer = db.query(Printer).filter(
            Printer.is_default == True,
            Printer.is_active == True
        ).first()
        
        if not default_printer:
            return {"success": False, "message": "No default printer configured"}
        
        # Connect to printer
        printer_config = {
            'type': default_printer.printer_type.value,
            'connection_string': default_printer.connection_string
        }
        
        # Parse connection string based on type
        if default_printer.printer_type == PrinterType.USB:
            vendor_id, product_id = default_printer.connection_string.split(':')
            printer_config['vendor_id'] = int(vendor_id, 16)
            printer_config['product_id'] = int(product_id, 16)
        elif default_printer.printer_type == PrinterType.SERIAL:
            printer_config['port'] = default_printer.connection_string
        elif default_printer.printer_type == PrinterType.NETWORK:
            host, port = default_printer.connection_string.split(':')
            printer_config['host'] = host
            printer_config['port'] = int(port)
        
        if not printer_service.connect_printer(printer_config):
            return {"success": False, "message": "Failed to connect to printer"}
        
        # Print QR code
        qr_data = [{"data": request.data, "title": request.title}]
        results = barcode_manager.print_qr_labels(qr_data, request.copies)
        
        printer_service.disconnect_printer()
        
        if results['success']:
            return {"success": True, "message": "QR code printed successfully"}
        else:
            return {"success": False, "message": "Failed to print QR code", "errors": results['errors']}
            
    except Exception as e:
        logger.error(f"Print QR code error: {e}")
        return {"success": False, "message": f"QR print error: {str(e)}"}