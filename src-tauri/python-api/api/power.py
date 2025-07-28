"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                    Power Management API                                           ║
║                                                                                                  ║
║  Description: FastAPI endpoints for power management, UPS monitoring, and transaction recovery.  ║
║               Provides real-time UPS status and power event logging capabilities.               ║
║                                                                                                  ║
║  Author: Akash Hasendra                                                                          ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime
import logging

from utils.power_service import power_service
from utils.auth import get_current_user
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/power", tags=["power"])


class TransactionStateRequest(BaseModel):
    """Request model for saving transaction state"""
    session_id: str
    transaction_data: Dict[str, Any]
    transaction_type: str
    customer_id: Optional[int] = None
    last_action: Optional[str] = None


class TransactionRecoveryRequest(BaseModel):
    """Request model for marking transaction as recovered"""
    session_id: str
    successful: bool
    notes: Optional[str] = None


@router.get("/ups/status")
async def get_ups_status(current_user: User = Depends(get_current_user)):
    """Get current UPS status and battery information"""
    try:
        ups_info = power_service.get_current_ups_info()
        return {
            "success": True,
            "data": ups_info
        }
    except Exception as e:
        logger.error(f"Error getting UPS status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get UPS status")


@router.post("/monitoring/start")
async def start_monitoring(
    background_tasks: BackgroundTasks,
    terminal_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Start UPS monitoring service"""
    try:
        if not terminal_id:
            terminal_id = f"TERMINAL-{current_user.id}"
            
        background_tasks.add_task(power_service.start_monitoring, terminal_id)
        
        return {
            "success": True,
            "message": f"Power monitoring started for terminal {terminal_id}"
        }
    except Exception as e:
        logger.error(f"Error starting power monitoring: {e}")
        raise HTTPException(status_code=500, detail="Failed to start power monitoring")


@router.post("/monitoring/stop")
async def stop_monitoring(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """Stop UPS monitoring service"""
    try:
        background_tasks.add_task(power_service.stop_monitoring)
        
        return {
            "success": True,
            "message": "Power monitoring stopped"
        }
    except Exception as e:
        logger.error(f"Error stopping power monitoring: {e}")
        raise HTTPException(status_code=500, detail="Failed to stop power monitoring")


@router.post("/transaction/save")
async def save_transaction_state(
    request: TransactionStateRequest,
    current_user: User = Depends(get_current_user)
):
    """Save transaction state for recovery"""
    try:
        await power_service.save_transaction_state(
            session_id=request.session_id,
            transaction_data=request.transaction_data,
            transaction_type=request.transaction_type,
            user_id=current_user.id,
            customer_id=request.customer_id,
            last_action=request.last_action
        )
        
        return {
            "success": True,
            "message": "Transaction state saved successfully"
        }
    except Exception as e:
        logger.error(f"Error saving transaction state: {e}")
        raise HTTPException(status_code=500, detail="Failed to save transaction state")


@router.get("/transaction/pending")
async def get_pending_transactions(current_user: User = Depends(get_current_user)):
    """Get pending transaction states for recovery"""
    try:
        pending_states = await power_service.get_pending_transaction_states()
        
        return {
            "success": True,
            "data": pending_states
        }
    except Exception as e:
        logger.error(f"Error getting pending transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get pending transactions")


@router.post("/transaction/recover")
async def mark_transaction_recovered(
    request: TransactionRecoveryRequest,
    current_user: User = Depends(get_current_user)
):
    """Mark a transaction as recovered"""
    try:
        await power_service.mark_transaction_recovered(
            session_id=request.session_id,
            successful=request.successful,
            notes=request.notes
        )
        
        return {
            "success": True,
            "message": "Transaction recovery status updated"
        }
    except Exception as e:
        logger.error(f"Error marking transaction as recovered: {e}")
        raise HTTPException(status_code=500, detail="Failed to update recovery status")


@router.get("/events")
async def get_power_events(
    limit: int = 100,
    event_type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get recent power events for analysis"""
    try:
        events = await power_service.get_power_events(limit=limit, event_type=event_type)
        
        return {
            "success": True,
            "data": events
        }
    except Exception as e:
        logger.error(f"Error getting power events: {e}")
        raise HTTPException(status_code=500, detail="Failed to get power events")


@router.get("/safe-mode/status")
async def get_safe_mode_status(current_user: User = Depends(get_current_user)):
    """Get current safe mode status"""
    try:
        return {
            "success": True,
            "data": {
                "safe_mode_active": power_service.safe_mode_active,
                "monitoring_active": power_service.monitoring_active,
                "battery_level": power_service.current_ups_info.battery_level,
                "ups_status": power_service.current_ups_info.status
            }
        }
    except Exception as e:
        logger.error(f"Error getting safe mode status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get safe mode status")


@router.get("/health")
async def power_system_health():
    """Get power system health status (no auth required for monitoring)"""
    try:
        ups_info = power_service.get_current_ups_info()
        
        # Determine overall health
        health_status = "healthy"
        if ups_info["status"] == "critical":
            health_status = "critical"
        elif ups_info["status"] in ["low_battery", "on_battery"]:
            health_status = "warning"
        elif ups_info["status"] == "not_detected":
            health_status = "unknown"
            
        return {
            "success": True,
            "data": {
                "health_status": health_status,
                "ups_status": ups_info["status"],
                "battery_level": ups_info["battery_level"],
                "safe_mode_active": ups_info["safe_mode_active"],
                "monitoring_active": ups_info["monitoring_active"],
                "last_update": ups_info["last_update"]
            }
        }
    except Exception as e:
        logger.error(f"Error getting power system health: {e}")
        return {
            "success": False,
            "data": {
                "health_status": "error",
                "error": str(e)
            }
        }