"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                    Terminal API Endpoints                                        │
│                                                                                                  │
│  Description: FastAPI endpoints for terminal management, network discovery,                       │
│               and multi-terminal synchronization.                                                │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime

from database.connection import get_db
from models.terminal import Terminal
from utils.network_service import network_service
from utils.sync_service import sync_service
from utils.auth import get_current_user_from_token

router = APIRouter(prefix="/api/terminals", tags=["terminals"])


# Pydantic models for request/response
class TerminalConfig(BaseModel):
    terminal_id: Optional[str] = None
    terminal_name: str
    display_name: Optional[str] = None
    terminal_type: str = "pos"
    is_main_terminal: bool = False
    app_version: str = "1.0.0"
    network_path: Optional[str] = None


class TerminalUpdate(BaseModel):
    terminal_name: Optional[str] = None
    display_name: Optional[str] = None
    status: Optional[str] = None
    configuration: Optional[Dict] = None


class SyncRequest(BaseModel):
    terminal_id: str
    force_sync: bool = False


class NetworkTestRequest(BaseModel):
    network_path: Optional[str] = None
    terminal_type: str = "client"


@router.post("/initialize")
async def initialize_terminal(
    config: TerminalConfig,
    current_user: dict = Depends(get_current_user_from_token)
):
    """Initialize and register a terminal"""
    try:
        terminal_config = {
            'terminal_id': config.terminal_id,
            'terminal_name': config.terminal_name,
            'display_name': config.display_name,
            'terminal_type': config.terminal_type,
            'is_main_terminal': config.is_main_terminal,
            'app_version': config.app_version
        }
        
        terminal_id = await network_service.initialize_terminal(terminal_config)
        
        return {
            "success": True,
            "terminal_id": terminal_id,
            "message": "Terminal initialized successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize terminal: {str(e)}")


@router.get("/discover")
async def discover_terminals(
    current_user: dict = Depends(get_current_user_from_token)
):
    """Discover all terminals on the network"""
    try:
        terminals = await network_service.discover_terminals()
        
        return {
            "success": True,
            "terminals": terminals,
            "count": len(terminals)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to discover terminals: {str(e)}")


@router.get("/{terminal_id}")
async def get_terminal(
    terminal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get terminal details by ID"""
    try:
        terminal = db.query(Terminal).filter(Terminal.terminal_id == terminal_id).first()
        
        if not terminal:
            raise HTTPException(status_code=404, detail="Terminal not found")
        
        terminal_data = {
            "terminal_id": terminal.terminal_id,
            "terminal_name": terminal.terminal_name,
            "display_name": terminal.display_name,
            "terminal_type": terminal.terminal_type,
            "is_main_terminal": terminal.is_main_terminal,
            "status": terminal.status,
            "ip_address": terminal.ip_address,
            "hostname": terminal.hostname,
            "hardware_id": terminal.hardware_id,
            "cpu_info": terminal.cpu_info,
            "memory_gb": terminal.memory_gb,
            "os_version": terminal.os_version,
            "app_version": terminal.app_version,
            "last_seen": terminal.last_seen.isoformat() if terminal.last_seen else None,
            "last_heartbeat": terminal.last_heartbeat.isoformat() if terminal.last_heartbeat else None,
            "last_sync_time": terminal.last_sync_time.isoformat() if terminal.last_sync_time else None,
            "sync_status": terminal.sync_status,
            "pending_sync_count": terminal.pending_sync_count,
            "ups_connected": terminal.ups_connected,
            "ups_battery_level": terminal.ups_battery_level,
            "ups_status": terminal.ups_status,
            "configuration": terminal.configuration,
            "uptime_status": terminal.get_uptime_status(),
            "sync_status_display": terminal.get_sync_status_display(),
            "is_online": terminal.is_online()
        }
        
        return {
            "success": True,
            "terminal": terminal_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get terminal: {str(e)}")


@router.put("/{terminal_id}")
async def update_terminal(
    terminal_id: str,
    update_data: TerminalUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Update terminal information"""
    try:
        terminal = db.query(Terminal).filter(Terminal.terminal_id == terminal_id).first()
        
        if not terminal:
            raise HTTPException(status_code=404, detail="Terminal not found")
        
        # Update fields if provided
        if update_data.terminal_name is not None:
            terminal.terminal_name = update_data.terminal_name
        if update_data.display_name is not None:
            terminal.display_name = update_data.display_name
        if update_data.status is not None:
            terminal.status = update_data.status
        if update_data.configuration is not None:
            terminal.configuration = update_data.configuration
        
        terminal.updated_at = datetime.now()
        db.commit()
        
        return {
            "success": True,
            "message": "Terminal updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update terminal: {str(e)}")


@router.post("/heartbeat")
async def send_heartbeat(
    current_user: dict = Depends(get_current_user_from_token)
):
    """Send heartbeat to update terminal status"""
    try:
        success = await network_service.send_heartbeat()
        
        if success:
            return {
                "success": True,
                "message": "Heartbeat sent successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to send heartbeat")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Heartbeat failed: {str(e)}")


@router.post("/test-network")
async def test_network_connectivity(
    request: NetworkTestRequest,
    current_user: dict = Depends(get_current_user_from_token)
):
    """Test network connectivity and main computer accessibility"""
    try:
        # Set network path if provided
        if request.network_path:
            network_service.network_path = request.network_path
            network_service.is_main_terminal = request.terminal_type == "main"
        
        connectivity = await network_service.check_network_connectivity()
        
        return {
            "success": True,
            "connectivity": connectivity
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Network test failed: {str(e)}")


@router.post("/sync")
async def sync_terminal_data(
    request: SyncRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user_from_token)
):
    """Synchronize terminal data"""
    try:
        # Run sync in background
        background_tasks.add_task(
            sync_service.sync_data,
            request.terminal_id,
            request.force_sync
        )
        
        return {
            "success": True,
            "message": "Sync started in background"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start sync: {str(e)}")


@router.get("/{terminal_id}/sync-status")
async def get_sync_status(
    terminal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get terminal synchronization status"""
    try:
        terminal = db.query(Terminal).filter(Terminal.terminal_id == terminal_id).first()
        
        if not terminal:
            raise HTTPException(status_code=404, detail="Terminal not found")
        
        sync_status = {
            "terminal_id": terminal_id,
            "sync_status": terminal.sync_status,
            "last_sync_time": terminal.last_sync_time.isoformat() if terminal.last_sync_time else None,
            "pending_sync_count": terminal.pending_sync_count,
            "needs_sync": terminal.needs_sync(),
            "sync_status_display": terminal.get_sync_status_display()
        }
        
        return {
            "success": True,
            "sync_status": sync_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sync status: {str(e)}")


@router.post("/offline-cache/initialize")
async def initialize_offline_cache(
    current_user: dict = Depends(get_current_user_from_token)
):
    """Initialize offline cache for terminal"""
    try:
        success = await sync_service.initialize_offline_cache()
        
        if success:
            return {
                "success": True,
                "message": "Offline cache initialized successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to initialize offline cache")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cache initialization failed: {str(e)}")


@router.get("/offline-cache/{table_name}")
async def get_offline_data(
    table_name: str,
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get data from offline cache"""
    try:
        data = await sync_service.get_offline_data(table_name)
        
        return {
            "success": True,
            "data": data,
            "count": len(data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get offline data: {str(e)}")


@router.delete("/{terminal_id}")
async def remove_terminal(
    terminal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token)
):
    """Remove terminal from network"""
    try:
        terminal = db.query(Terminal).filter(Terminal.terminal_id == terminal_id).first()
        
        if not terminal:
            raise HTTPException(status_code=404, detail="Terminal not found")
        
        # Check if this is the main terminal
        if terminal.is_main_terminal:
            raise HTTPException(status_code=400, detail="Cannot remove main terminal")
        
        db.delete(terminal)
        db.commit()
        
        return {
            "success": True,
            "message": "Terminal removed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove terminal: {str(e)}")


@router.get("/diagnostics/network")
async def run_network_diagnostics(
    current_user: dict = Depends(get_current_user_from_token)
):
    """Run comprehensive network diagnostics"""
    try:
        connectivity = await network_service.check_network_connectivity()
        
        diagnostics = {
            "timestamp": datetime.now().isoformat(),
            "network_connectivity": connectivity,
            "terminal_count": len(await network_service.discover_terminals()),
            "system_info": {
                "platform": "Windows",  # Would be detected dynamically
                "network_interfaces": "Available",  # Would be actual interface info
            }
        }
        
        return {
            "success": True,
            "diagnostics": diagnostics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostics failed: {str(e)}")
