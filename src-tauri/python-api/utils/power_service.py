"""
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        CEYBYTE POS                                               ║
║                                                                                                  ║
║                                    Power Management Service                                      ║
║                                                                                                  ║
║  Description: Service for UPS monitoring, power event logging, and transaction state management. ║
║               Handles auto-save, safe mode activation, and power restoration recovery.           ║
║                                                                                                  ║
║  Author: Akash Hasendra                                                                          ║
║  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   ║
║  License: MIT License with Sri Lankan Business Terms                                             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
"""

import asyncio
import json
import logging
import platform
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database.connection import get_db
from models.power_event import PowerEvent, TransactionState

logger = logging.getLogger(__name__)


class UPSInfo:
    """UPS information data class"""
    def __init__(self):
        self.status: str = "not_detected"  # online, on_battery, low_battery, critical, not_detected
        self.battery_level: float = 0.0  # 0-100
        self.estimated_runtime: int = 0  # minutes
        self.voltage: float = 0.0
        self.model: str = ""
        self.is_charging: bool = False
        self.last_update: datetime = datetime.now()


class PowerService:
    """Service for managing power events and UPS monitoring"""
    
    def __init__(self):
        self.current_ups_info = UPSInfo()
        self.safe_mode_active = False
        self.monitoring_active = False
        self.terminal_id = "MAIN-001"  # Default terminal ID
        self.low_battery_threshold = 20.0  # Percentage
        self.critical_battery_threshold = 10.0  # Percentage
        
    async def start_monitoring(self, terminal_id: str = None):
        """Start UPS monitoring service"""
        if terminal_id:
            self.terminal_id = terminal_id
            
        self.monitoring_active = True
        logger.info(f"Starting power monitoring for terminal {self.terminal_id}")
        
        # Start monitoring loop
        asyncio.create_task(self._monitoring_loop())
        
    async def stop_monitoring(self):
        """Stop UPS monitoring service"""
        self.monitoring_active = False
        logger.info("Power monitoring stopped")
        
    async def _monitoring_loop(self):
        """Main monitoring loop for UPS status"""
        while self.monitoring_active:
            try:
                # Check UPS status
                await self._check_ups_status()
                
                # Check for power events
                await self._process_power_events()
                
                # Clean up old transaction states
                await self._cleanup_old_states()
                
                # Wait before next check
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in power monitoring loop: {e}")
                await asyncio.sleep(60)  # Wait longer on error
                
    async def _check_ups_status(self):
        """Check current UPS status using system commands"""
        try:
            if platform.system() == "Windows":
                ups_info = await self._check_windows_ups()
            elif platform.system() == "Linux":
                ups_info = await self._check_linux_ups()
            else:
                # Fallback for other systems
                ups_info = await self._simulate_ups_status()
                
            # Update current status
            old_status = self.current_ups_info.status
            self.current_ups_info = ups_info
            
            # Log status changes
            if old_status != ups_info.status:
                await self._log_power_event(
                    event_type=f"status_change_{ups_info.status}",
                    ups_info=ups_info
                )
                
            # Check for safe mode activation
            await self._check_safe_mode()
            
        except Exception as e:
            logger.error(f"Error checking UPS status: {e}")
            
    async def _check_windows_ups(self) -> UPSInfo:
        """Check UPS status on Windows using WMI"""
        ups_info = UPSInfo()
        
        try:
            # Use PowerShell to query UPS information
            cmd = [
                "powershell", "-Command",
                "Get-WmiObject -Class Win32_Battery | Select-Object EstimatedChargeRemaining, BatteryStatus, EstimatedRunTime"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and result.stdout.strip():
                # Parse PowerShell output
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if 'EstimatedChargeRemaining' in line:
                        try:
                            charge = float(line.split(':')[1].strip())
                            ups_info.battery_level = charge
                        except:
                            pass
                    elif 'BatteryStatus' in line:
                        status = line.split(':')[1].strip()
                        if status == "2":  # On AC power
                            ups_info.status = "online"
                            ups_info.is_charging = True
                        elif status == "1":  # On battery
                            ups_info.status = "on_battery"
                            ups_info.is_charging = False
                            
                # Set status based on battery level
                if ups_info.battery_level > 0:
                    if ups_info.battery_level <= self.critical_battery_threshold:
                        ups_info.status = "critical"
                    elif ups_info.battery_level <= self.low_battery_threshold:
                        ups_info.status = "low_battery"
                    elif ups_info.status == "not_detected":
                        ups_info.status = "online"
                        
                ups_info.model = "Windows UPS"
                ups_info.voltage = 230.0  # Default for Sri Lanka
                ups_info.last_update = datetime.now()
                
            else:
                # No UPS detected or error
                ups_info.status = "not_detected"
                
        except Exception as e:
            logger.error(f"Error checking Windows UPS: {e}")
            ups_info.status = "not_detected"
            
        return ups_info
        
    async def _check_linux_ups(self) -> UPSInfo:
        """Check UPS status on Linux using upsc or apcaccess"""
        ups_info = UPSInfo()
        
        try:
            # Try upsc first (Network UPS Tools)
            try:
                result = subprocess.run(["upsc", "ups"], capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    return self._parse_upsc_output(result.stdout)
            except FileNotFoundError:
                pass
                
            # Try apcaccess (APC UPS daemon)
            try:
                result = subprocess.run(["apcaccess"], capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    return self._parse_apcaccess_output(result.stdout)
            except FileNotFoundError:
                pass
                
            # No UPS tools found
            ups_info.status = "not_detected"
            
        except Exception as e:
            logger.error(f"Error checking Linux UPS: {e}")
            ups_info.status = "not_detected"
            
        return ups_info
        
    async def _simulate_ups_status(self) -> UPSInfo:
        """Simulate UPS status for development/testing"""
        ups_info = UPSInfo()
        ups_info.status = "online"
        ups_info.battery_level = 85.0
        ups_info.estimated_runtime = 45
        ups_info.voltage = 230.0
        ups_info.model = "Simulated UPS 650VA"
        ups_info.is_charging = True
        ups_info.last_update = datetime.now()
        return ups_info
        
    def _parse_upsc_output(self, output: str) -> UPSInfo:
        """Parse upsc command output"""
        ups_info = UPSInfo()
        
        for line in output.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()
                
                if key == 'battery.charge':
                    ups_info.battery_level = float(value)
                elif key == 'battery.runtime':
                    ups_info.estimated_runtime = int(float(value) / 60)  # Convert seconds to minutes
                elif key == 'input.voltage':
                    ups_info.voltage = float(value)
                elif key == 'ups.model':
                    ups_info.model = value
                elif key == 'ups.status':
                    if 'OL' in value:  # Online
                        ups_info.status = "online"
                        ups_info.is_charging = True
                    elif 'OB' in value:  # On Battery
                        ups_info.status = "on_battery"
                        ups_info.is_charging = False
                        
        # Set status based on battery level
        if ups_info.battery_level <= self.critical_battery_threshold:
            ups_info.status = "critical"
        elif ups_info.battery_level <= self.low_battery_threshold:
            ups_info.status = "low_battery"
            
        ups_info.last_update = datetime.now()
        return ups_info
        
    def _parse_apcaccess_output(self, output: str) -> UPSInfo:
        """Parse apcaccess command output"""
        ups_info = UPSInfo()
        
        for line in output.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()
                
                if key == 'BCHARGE':
                    ups_info.battery_level = float(value.replace(' Percent', ''))
                elif key == 'TIMELEFT':
                    time_parts = value.replace(' Minutes', '').split()
                    if time_parts:
                        ups_info.estimated_runtime = int(float(time_parts[0]))
                elif key == 'LINEV':
                    ups_info.voltage = float(value.replace(' Volts', ''))
                elif key == 'MODEL':
                    ups_info.model = value
                elif key == 'STATUS':
                    if 'ONLINE' in value:
                        ups_info.status = "online"
                        ups_info.is_charging = True
                    elif 'ONBATT' in value:
                        ups_info.status = "on_battery"
                        ups_info.is_charging = False
                        
        # Set status based on battery level
        if ups_info.battery_level <= self.critical_battery_threshold:
            ups_info.status = "critical"
        elif ups_info.battery_level <= self.low_battery_threshold:
            ups_info.status = "low_battery"
            
        ups_info.last_update = datetime.now()
        return ups_info
        
    async def _check_safe_mode(self):
        """Check if safe mode should be activated"""
        should_activate = (
            self.current_ups_info.status in ["low_battery", "critical"] or
            self.current_ups_info.battery_level <= self.low_battery_threshold
        )
        
        if should_activate and not self.safe_mode_active:
            await self._activate_safe_mode()
        elif not should_activate and self.safe_mode_active:
            await self._deactivate_safe_mode()
            
    async def _activate_safe_mode(self):
        """Activate safe mode to prevent new transactions"""
        self.safe_mode_active = True
        logger.warning("Safe mode activated due to low battery")
        
        await self._log_power_event(
            event_type="safe_mode_activated",
            ups_info=self.current_ups_info,
            notes="Safe mode activated to prevent data loss"
        )
        
    async def _deactivate_safe_mode(self):
        """Deactivate safe mode when power is restored"""
        self.safe_mode_active = False
        logger.info("Safe mode deactivated - power restored")
        
        await self._log_power_event(
            event_type="safe_mode_deactivated",
            ups_info=self.current_ups_info,
            notes="Safe mode deactivated - power restored"
        )
        
        # Process any pending receipts
        await self._process_pending_receipts()
        
    async def _process_power_events(self):
        """Process any power-related events"""
        # This method can be extended to handle specific power events
        pass
        
    async def _log_power_event(self, event_type: str, ups_info: UPSInfo, notes: str = None, event_metadata: Dict = None):
        """Log a power event to the database"""
        try:
            db = next(get_db())
            
            power_event = PowerEvent(
                terminal_id=self.terminal_id,
                event_type=event_type,
                ups_status=ups_info.status,
                battery_level=ups_info.battery_level,
                estimated_runtime=ups_info.estimated_runtime,
                voltage=ups_info.voltage,
                ups_model=ups_info.model,
                notes=notes,
                event_metadata=event_metadata
            )
            
            db.add(power_event)
            db.commit()
            
            logger.info(f"Power event logged: {event_type} for terminal {self.terminal_id}")
            
        except Exception as e:
            logger.error(f"Error logging power event: {e}")
            
    async def save_transaction_state(self, session_id: str, transaction_data: Dict, 
                                   transaction_type: str, user_id: int, 
                                   customer_id: int = None, last_action: str = None):
        """Save transaction state for recovery"""
        try:
            db = next(get_db())
            
            # Check if state already exists
            existing_state = db.query(TransactionState).filter(
                TransactionState.session_id == session_id,
                TransactionState.terminal_id == self.terminal_id
            ).first()
            
            if existing_state:
                # Update existing state
                existing_state.transaction_data = transaction_data
                existing_state.last_action = last_action
                existing_state.auto_save_count += 1
                existing_state.updated_at = datetime.now()
            else:
                # Create new state
                transaction_state = TransactionState(
                    terminal_id=self.terminal_id,
                    session_id=session_id,
                    transaction_data=transaction_data,
                    transaction_type=transaction_type,
                    customer_id=customer_id,
                    user_id=user_id,
                    last_action=last_action,
                    auto_save_count=1,
                    expires_at=datetime.now() + timedelta(hours=24)  # Expire after 24 hours
                )
                db.add(transaction_state)
                
            db.commit()
            logger.debug(f"Transaction state saved for session {session_id}")
            
        except Exception as e:
            logger.error(f"Error saving transaction state: {e}")
            
    async def get_pending_transaction_states(self) -> List[Dict]:
        """Get all pending transaction states for recovery"""
        try:
            db = next(get_db())
            
            states = db.query(TransactionState).filter(
                TransactionState.terminal_id == self.terminal_id,
                TransactionState.state_type == 'active',
                TransactionState.recovery_attempted == False
            ).all()
            
            return [state.to_dict() for state in states]
            
        except Exception as e:
            logger.error(f"Error getting pending transaction states: {e}")
            return []
            
    async def mark_transaction_recovered(self, session_id: str, successful: bool, notes: str = None):
        """Mark a transaction as recovered"""
        try:
            db = next(get_db())
            
            state = db.query(TransactionState).filter(
                TransactionState.session_id == session_id,
                TransactionState.terminal_id == self.terminal_id
            ).first()
            
            if state:
                state.recovery_attempted = True
                state.recovery_successful = successful
                state.recovery_timestamp = datetime.now()
                state.recovery_notes = notes
                state.state_type = 'recovered' if successful else 'failed'
                
                db.commit()
                logger.info(f"Transaction {session_id} marked as {'recovered' if successful else 'failed'}")
                
        except Exception as e:
            logger.error(f"Error marking transaction as recovered: {e}")
            
    async def _process_pending_receipts(self):
        """Process any pending receipts after power restoration"""
        try:
            db = next(get_db())
            
            # Get states with pending receipts
            states = db.query(TransactionState).filter(
                TransactionState.terminal_id == self.terminal_id,
                TransactionState.pending_receipts.isnot(None),
                TransactionState.print_attempts < 3  # Max 3 attempts
            ).all()
            
            for state in states:
                if state.pending_receipts:
                    # Process each pending receipt
                    for receipt_data in state.pending_receipts:
                        try:
                            # Here you would integrate with the printer service
                            # await printer_service.print_receipt(receipt_data)
                            logger.info(f"Processed pending receipt for session {state.session_id}")
                        except Exception as e:
                            logger.error(f"Error printing pending receipt: {e}")
                            
                    # Update print attempts
                    state.print_attempts += 1
                    if state.print_attempts >= 3:
                        state.pending_receipts = None  # Clear after max attempts
                        
            db.commit()
            
        except Exception as e:
            logger.error(f"Error processing pending receipts: {e}")
            
    async def _cleanup_old_states(self):
        """Clean up old transaction states"""
        try:
            db = next(get_db())
            
            # Delete expired states
            cutoff_time = datetime.now() - timedelta(hours=48)  # Keep for 48 hours
            
            deleted_count = db.query(TransactionState).filter(
                TransactionState.created_at < cutoff_time,
                TransactionState.state_type.in_(['recovered', 'failed', 'completed'])
            ).delete()
            
            if deleted_count > 0:
                db.commit()
                logger.info(f"Cleaned up {deleted_count} old transaction states")
                
        except Exception as e:
            logger.error(f"Error cleaning up old states: {e}")
            
    def get_current_ups_info(self) -> Dict:
        """Get current UPS information"""
        return {
            "status": self.current_ups_info.status,
            "battery_level": self.current_ups_info.battery_level,
            "estimated_runtime": self.current_ups_info.estimated_runtime,
            "voltage": self.current_ups_info.voltage,
            "model": self.current_ups_info.model,
            "is_charging": self.current_ups_info.is_charging,
            "last_update": self.current_ups_info.last_update.isoformat(),
            "safe_mode_active": self.safe_mode_active,
            "monitoring_active": self.monitoring_active
        }
        
    async def get_power_events(self, limit: int = 100, event_type: str = None) -> List[Dict]:
        """Get recent power events"""
        try:
            db = next(get_db())
            
            query = db.query(PowerEvent).filter(
                PowerEvent.terminal_id == self.terminal_id
            )
            
            if event_type:
                query = query.filter(PowerEvent.event_type == event_type)
                
            events = query.order_by(desc(PowerEvent.event_timestamp)).limit(limit).all()
            
            return [event.to_dict() for event in events]
            
        except Exception as e:
            logger.error(f"Error getting power events: {e}")
            return []


# Global power service instance
power_service = PowerService()