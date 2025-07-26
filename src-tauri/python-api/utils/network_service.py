"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                    Network Service                                               │
│                                                                                                  │
│  Description: Core network service for multi-terminal POS system management.                     │
│               Handles terminal discovery, registration, and network communication.               │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import os
import socket
import platform
import psutil
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models.terminal import Terminal
from database.connection import get_db
import logging

logger = logging.getLogger(__name__)


class NetworkService:
    """Core network service for multi-terminal support"""
    
    def __init__(self):
        self.current_terminal_id = None
        self.is_main_terminal = False
        self.network_path = None
        self.heartbeat_interval = 30  # seconds
        self.sync_interval = 60  # seconds
        
    async def initialize_terminal(self, terminal_config: Dict) -> str:
        """Initialize current terminal and register in database"""
        try:
            db = next(get_db())
            
            # Generate or use existing terminal ID
            terminal_id = terminal_config.get('terminal_id') or self._generate_terminal_id()
            
            # Get system information
            system_info = self._get_system_info()
            
            # Check if terminal already exists
            existing_terminal = db.query(Terminal).filter(
                Terminal.terminal_id == terminal_id
            ).first()
            
            if existing_terminal:
                # Update existing terminal
                terminal = existing_terminal
                terminal.last_seen = datetime.now()
                terminal.status = "online"
            else:
                # Create new terminal
                terminal = Terminal(
                    terminal_id=terminal_id,
                    terminal_name=terminal_config.get('terminal_name', f'Terminal-{terminal_id}'),
                    display_name=terminal_config.get('display_name'),
                    terminal_type=terminal_config.get('terminal_type', 'pos'),
                    is_main_terminal=terminal_config.get('is_main_terminal', False),
                    hardware_id=system_info['hardware_id'],
                    cpu_info=system_info['cpu_info'],
                    memory_gb=system_info['memory_gb'],
                    storage_gb=system_info['storage_gb'],
                    os_version=system_info['os_version'],
                    app_version=terminal_config.get('app_version', '1.0.0'),
                    status="online",
                    last_seen=datetime.now(),
                    last_heartbeat=datetime.now()
                )
                db.add(terminal)
            
            # Update network information
            network_info = self._get_network_info()
            terminal.ip_address = network_info['ip_address']
            terminal.mac_address = network_info['mac_address']
            terminal.hostname = network_info['hostname']
            
            db.commit()
            
            # Store current terminal info
            self.current_terminal_id = terminal_id
            self.is_main_terminal = terminal.is_main_terminal
            
            logger.info(f"Terminal {terminal_id} initialized successfully")
            return terminal_id
            
        except Exception as e:
            logger.error(f"Error initializing terminal: {e}")
            raise
        finally:
            db.close()
    
    async def discover_terminals(self) -> List[Dict]:
        """Discover all terminals on the network"""
        try:
            db = next(get_db())
            
            terminals = db.query(Terminal).all()
            terminal_list = []
            
            for terminal in terminals:
                terminal_info = {
                    'terminal_id': terminal.terminal_id,
                    'terminal_name': terminal.terminal_name,
                    'display_name': terminal.display_name,
                    'terminal_type': terminal.terminal_type,
                    'is_main_terminal': terminal.is_main_terminal,
                    'status': terminal.status,
                    'ip_address': terminal.ip_address,
                    'hostname': terminal.hostname,
                    'last_seen': terminal.last_seen.isoformat() if terminal.last_seen else None,
                    'uptime_status': terminal.get_uptime_status(),
                    'sync_status': terminal.get_sync_status_display(),
                    'is_online': terminal.is_online()
                }
                terminal_list.append(terminal_info)
            
            return terminal_list
            
        except Exception as e:
            logger.error(f"Error discovering terminals: {e}")
            return []
        finally:
            db.close()
    
    async def send_heartbeat(self) -> bool:
        """Send heartbeat to update terminal status"""
        try:
            if not self.current_terminal_id:
                return False
                
            db = next(get_db())
            
            terminal = db.query(Terminal).filter(
                Terminal.terminal_id == self.current_terminal_id
            ).first()
            
            if terminal:
                terminal.update_heartbeat()
                
                # Update performance metrics
                terminal.avg_response_time_ms = self._get_avg_response_time()
                
                # Update UPS status if available
                ups_info = self._get_ups_info()
                terminal.ups_connected = ups_info['connected']
                terminal.ups_battery_level = ups_info['battery_level']
                terminal.ups_status = ups_info['status']
                
                db.commit()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error sending heartbeat: {e}")
            return False
        finally:
            db.close()
    
    async def check_network_connectivity(self) -> Dict:
        """Check network connectivity and main computer accessibility"""
        try:
            connectivity_status = {
                'network_available': False,
                'main_computer_reachable': False,
                'shared_folder_accessible': False,
                'database_accessible': False,
                'latency_ms': None,
                'error_message': None
            }
            
            # Test basic network connectivity
            try:
                socket.create_connection(("8.8.8.8", 53), timeout=3)
                connectivity_status['network_available'] = True
            except OSError:
                connectivity_status['error_message'] = "No network connectivity"
                return connectivity_status
            
            # If this is a client terminal, test main computer connectivity
            if not self.is_main_terminal and self.network_path:
                start_time = datetime.now()
                
                try:
                    # Test if network path is accessible
                    if os.path.exists(self.network_path):
                        connectivity_status['shared_folder_accessible'] = True
                        connectivity_status['main_computer_reachable'] = True
                        
                        # Test database accessibility
                        db_path = os.path.join(self.network_path, 'ceybyte_pos.db')
                        if os.path.exists(db_path):
                            connectivity_status['database_accessible'] = True
                        
                        # Calculate latency
                        end_time = datetime.now()
                        latency = (end_time - start_time).total_seconds() * 1000
                        connectivity_status['latency_ms'] = int(latency)
                    
                except Exception as e:
                    connectivity_status['error_message'] = f"Network path error: {str(e)}"
            
            else:
                # Main terminal - always accessible to itself
                connectivity_status['main_computer_reachable'] = True
                connectivity_status['shared_folder_accessible'] = True
                connectivity_status['database_accessible'] = True
                connectivity_status['latency_ms'] = 1
            
            return connectivity_status
            
        except Exception as e:
            logger.error(f"Error checking network connectivity: {e}")
            return {
                'network_available': False,
                'main_computer_reachable': False,
                'shared_folder_accessible': False,
                'database_accessible': False,
                'latency_ms': None,
                'error_message': str(e)
            }
    
    async def update_terminal_status(self, terminal_id: str, status: str) -> bool:
        """Update terminal status"""
        try:
            db = next(get_db())
            
            terminal = db.query(Terminal).filter(
                Terminal.terminal_id == terminal_id
            ).first()
            
            if terminal:
                terminal.status = status
                if status == "offline":
                    terminal.set_offline()
                else:
                    terminal.last_seen = datetime.now()
                
                db.commit()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error updating terminal status: {e}")
            return False
        finally:
            db.close()
    
    def _generate_terminal_id(self) -> str:
        """Generate unique terminal ID"""
        import uuid
        return f"TERM-{uuid.uuid4().hex[:8].upper()}"
    
    def _get_system_info(self) -> Dict:
        """Get system hardware and software information"""
        try:
            # Get CPU info
            cpu_info = f"{platform.processor()}"
            if not cpu_info.strip():
                cpu_info = f"{psutil.cpu_count()} cores"
            
            # Get memory info
            memory = psutil.virtual_memory()
            memory_gb = round(memory.total / (1024**3))
            
            # Get storage info
            disk = psutil.disk_usage('/')
            storage_gb = round(disk.total / (1024**3))
            
            # Generate hardware ID
            import uuid
            hardware_id = str(uuid.getnode())  # MAC address as hardware ID
            
            return {
                'hardware_id': hardware_id,
                'cpu_info': cpu_info[:200],  # Limit length
                'memory_gb': memory_gb,
                'storage_gb': storage_gb,
                'os_version': f"{platform.system()} {platform.release()}"
            }
            
        except Exception as e:
            logger.error(f"Error getting system info: {e}")
            return {
                'hardware_id': 'unknown',
                'cpu_info': 'unknown',
                'memory_gb': 4,
                'storage_gb': 100,
                'os_version': 'unknown'
            }
    
    def _get_network_info(self) -> Dict:
        """Get network interface information"""
        try:
            hostname = socket.gethostname()
            
            # Get IP address
            ip_address = socket.gethostbyname(hostname)
            
            # Get MAC address
            import uuid
            mac_address = ':'.join(['{:02x}'.format((uuid.getnode() >> elements) & 0xff) 
                                  for elements in range(0,2*6,2)][::-1])
            
            return {
                'ip_address': ip_address,
                'mac_address': mac_address,
                'hostname': hostname
            }
            
        except Exception as e:
            logger.error(f"Error getting network info: {e}")
            return {
                'ip_address': '127.0.0.1',
                'mac_address': '00:00:00:00:00:00',
                'hostname': 'localhost'
            }
    
    def _get_avg_response_time(self) -> int:
        """Get average response time (mock implementation)"""
        # In real implementation, this would track actual response times
        return 50  # milliseconds
    
    def _get_ups_info(self) -> Dict:
        """Get UPS status information (mock implementation)"""
        # In real implementation, this would interface with UPS hardware
        return {
            'connected': False,
            'battery_level': None,
            'status': None
        }


# Global network service instance
network_service = NetworkService()