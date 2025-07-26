"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                    Sync Service                                                  │
│                                                                                                  │
│  Description: Data synchronization service for multi-terminal POS systems.                       │
│               Handles offline caching, transaction queuing, and conflict resolution.             │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

import os
import json
import sqlite3
import shutil
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, text
from models.terminal import Terminal
from models.sale import Sale
from models.customer import Customer
from models.product import Product
from database.connection import get_db
import logging

logger = logging.getLogger(__name__)


class SyncService:
    """Data synchronization service for multi-terminal support"""
    
    def __init__(self):
        self.local_cache_path = "local_cache.db"
        self.sync_queue_path = "sync_queue.json"
        self.conflict_log_path = "conflict_log.json"
        self.last_sync_time = None
        
    async def initialize_offline_cache(self) -> bool:
        """Initialize local cache database for offline operations"""
        try:
            # Create local cache database with same schema as main database
            cache_conn = sqlite3.connect(self.local_cache_path)
            
            # Copy schema from main database
            main_db_path = "ceybyte_pos.db"
            if os.path.exists(main_db_path):
                main_conn = sqlite3.connect(main_db_path)
                
                # Get schema from main database
                schema_query = "SELECT sql FROM sqlite_master WHERE type='table'"
                tables = main_conn.execute(schema_query).fetchall()
                
                # Create tables in cache database
                for table_sql in tables:
                    if table_sql[0]:  # Skip None values
                        cache_conn.execute(table_sql[0])
                
                main_conn.close()
            
            cache_conn.commit()
            cache_conn.close()
            
            logger.info("Offline cache initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error initializing offline cache: {e}")
            return False
    
    async def sync_data(self, terminal_id: str, force_sync: bool = False) -> Dict:
        """Synchronize data between terminals"""
        try:
            sync_result = {
                'success': False,
                'synced_tables': [],
                'conflicts_resolved': 0,
                'errors': [],
                'sync_time': datetime.now().isoformat(),
                'records_synced': 0
            }
            
            db = next(get_db())
            
            # Get terminal info
            terminal = db.query(Terminal).filter(
                Terminal.terminal_id == terminal_id
            ).first()
            
            if not terminal:
                sync_result['errors'].append(f"Terminal {terminal_id} not found")
                return sync_result
            
            # Check if sync is needed
            if not force_sync and not terminal.needs_sync():
                sync_result['success'] = True
                sync_result['message'] = "No sync needed"
                return sync_result
            
            # Process sync queue
            queue_result = await self._process_sync_queue(terminal_id)
            sync_result['records_synced'] += queue_result['processed']
            sync_result['errors'].extend(queue_result['errors'])
            
            # Sync core data tables
            tables_to_sync = ['products', 'customers', 'suppliers', 'categories']
            
            for table_name in tables_to_sync:
                try:
                    table_result = await self._sync_table(table_name, terminal_id)
                    if table_result['success']:
                        sync_result['synced_tables'].append(table_name)
                        sync_result['records_synced'] += table_result['records']
                    else:
                        sync_result['errors'].extend(table_result['errors'])
                        
                except Exception as e:
                    sync_result['errors'].append(f"Error syncing {table_name}: {str(e)}")
            
            # Handle conflicts
            conflicts = await self._resolve_conflicts(terminal_id)
            sync_result['conflicts_resolved'] = len(conflicts)
            
            # Update terminal sync status
            terminal.last_sync_time = datetime.now()
            terminal.sync_status = "synced" if not sync_result['errors'] else "failed"
            terminal.pending_sync_count = 0
            
            db.commit()
            
            sync_result['success'] = len(sync_result['errors']) == 0
            
            logger.info(f"Sync completed for terminal {terminal_id}: {sync_result}")
            return sync_result
            
        except Exception as e:
            logger.error(f"Error during sync: {e}")
            return {
                'success': False,
                'errors': [str(e)],
                'sync_time': datetime.now().isoformat(),
                'records_synced': 0
            }
        finally:
            db.close()
    
    async def queue_transaction(self, transaction_data: Dict) -> bool:
        """Queue transaction for later synchronization"""
        try:
            # Load existing queue
            queue = self._load_sync_queue()
            
            # Add transaction to queue
            transaction_data['queued_at'] = datetime.now().isoformat()
            transaction_data['sync_status'] = 'pending'
            transaction_data['retry_count'] = 0
            
            queue.append(transaction_data)
            
            # Save updated queue
            self._save_sync_queue(queue)
            
            # Update terminal pending count
            await self._update_pending_sync_count()
            
            logger.info(f"Transaction queued: {transaction_data.get('type', 'unknown')}")
            return True
            
        except Exception as e:
            logger.error(f"Error queuing transaction: {e}")
            return False
    
    async def get_offline_data(self, table_name: str, filters: Dict = None) -> List[Dict]:
        """Get data from offline cache"""
        try:
            if not os.path.exists(self.local_cache_path):
                return []
            
            cache_conn = sqlite3.connect(self.local_cache_path)
            cache_conn.row_factory = sqlite3.Row
            
            # Build query
            query = f"SELECT * FROM {table_name}"
            params = []
            
            if filters:
                conditions = []
                for key, value in filters.items():
                    conditions.append(f"{key} = ?")
                    params.append(value)
                
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            cursor = cache_conn.execute(query, params)
            rows = cursor.fetchall()
            
            # Convert to list of dictionaries
            result = [dict(row) for row in rows]
            
            cache_conn.close()
            return result
            
        except Exception as e:
            logger.error(f"Error getting offline data: {e}")
            return []
    
    async def save_offline_data(self, table_name: str, data: Dict) -> bool:
        """Save data to offline cache"""
        try:
            if not os.path.exists(self.local_cache_path):
                await self.initialize_offline_cache()
            
            cache_conn = sqlite3.connect(self.local_cache_path)
            
            # Build insert/update query
            columns = list(data.keys())
            placeholders = ['?' for _ in columns]
            values = list(data.values())
            
            # Try insert first, then update on conflict
            insert_query = f"""
                INSERT OR REPLACE INTO {table_name} 
                ({', '.join(columns)}) 
                VALUES ({', '.join(placeholders)})
            """
            
            cache_conn.execute(insert_query, values)
            cache_conn.commit()
            cache_conn.close()
            
            return True
            
        except Exception as e:
            logger.error(f"Error saving offline data: {e}")
            return False
    
    async def _process_sync_queue(self, terminal_id: str) -> Dict:
        """Process pending transactions in sync queue"""
        try:
            queue = self._load_sync_queue()
            processed = 0
            errors = []
            
            for transaction in queue[:]:  # Copy list to allow modification
                try:
                    success = await self._process_queued_transaction(transaction)
                    
                    if success:
                        queue.remove(transaction)
                        processed += 1
                    else:
                        transaction['retry_count'] += 1
                        transaction['last_retry'] = datetime.now().isoformat()
                        
                        # Remove after max retries
                        if transaction['retry_count'] >= 3:
                            queue.remove(transaction)
                            errors.append(f"Transaction failed after 3 retries: {transaction.get('type')}")
                
                except Exception as e:
                    errors.append(f"Error processing transaction: {str(e)}")
            
            # Save updated queue
            self._save_sync_queue(queue)
            
            return {
                'processed': processed,
                'errors': errors,
                'remaining': len(queue)
            }
            
        except Exception as e:
            logger.error(f"Error processing sync queue: {e}")
            return {'processed': 0, 'errors': [str(e)], 'remaining': 0}
    
    async def _sync_table(self, table_name: str, terminal_id: str) -> Dict:
        """Synchronize specific table data"""
        try:
            db = next(get_db())
            
            # Get last sync time for this terminal
            terminal = db.query(Terminal).filter(
                Terminal.terminal_id == terminal_id
            ).first()
            
            last_sync = terminal.last_sync_time if terminal else None
            
            # Query for updated records since last sync
            if table_name == 'products':
                model = Product
            elif table_name == 'customers':
                model = Customer
            else:
                # Skip unknown tables
                return {'success': True, 'records': 0, 'errors': []}
            
            query = db.query(model)
            if last_sync:
                query = query.filter(model.updated_at > last_sync)
            
            records = query.all()
            
            # Update local cache
            synced_count = 0
            for record in records:
                record_data = {
                    column.name: getattr(record, column.name)
                    for column in record.__table__.columns
                }
                
                success = await self.save_offline_data(table_name, record_data)
                if success:
                    synced_count += 1
            
            return {
                'success': True,
                'records': synced_count,
                'errors': []
            }
            
        except Exception as e:
            logger.error(f"Error syncing table {table_name}: {e}")
            return {
                'success': False,
                'records': 0,
                'errors': [str(e)]
            }
        finally:
            db.close()
    
    async def _resolve_conflicts(self, terminal_id: str) -> List[Dict]:
        """Resolve data conflicts between terminals"""
        try:
            conflicts = []
            
            # Load conflict log
            conflict_log = self._load_conflict_log()
            
            # Process each conflict
            for conflict in conflict_log[:]:  # Copy to allow modification
                try:
                    resolution = await self._resolve_single_conflict(conflict)
                    
                    if resolution['resolved']:
                        conflicts.append(resolution)
                        conflict_log.remove(conflict)
                    else:
                        conflict['retry_count'] = conflict.get('retry_count', 0) + 1
                        
                        # Remove after max retries
                        if conflict['retry_count'] >= 3:
                            conflict_log.remove(conflict)
                
                except Exception as e:
                    logger.error(f"Error resolving conflict: {e}")
            
            # Save updated conflict log
            self._save_conflict_log(conflict_log)
            
            return conflicts
            
        except Exception as e:
            logger.error(f"Error resolving conflicts: {e}")
            return []
    
    async def _resolve_single_conflict(self, conflict: Dict) -> Dict:
        """Resolve a single data conflict"""
        try:
            # Simple conflict resolution: last write wins
            resolution_strategy = conflict.get('strategy', 'last_write_wins')
            
            if resolution_strategy == 'last_write_wins':
                # Use the record with the latest timestamp
                local_time = datetime.fromisoformat(conflict['local_timestamp'])
                remote_time = datetime.fromisoformat(conflict['remote_timestamp'])
                
                winning_record = conflict['remote_data'] if remote_time > local_time else conflict['local_data']
                
                # Update database with winning record
                success = await self.save_offline_data(conflict['table'], winning_record)
                
                return {
                    'resolved': success,
                    'strategy': resolution_strategy,
                    'winner': 'remote' if remote_time > local_time else 'local',
                    'conflict_id': conflict.get('id')
                }
            
            return {'resolved': False, 'reason': 'Unknown strategy'}
            
        except Exception as e:
            logger.error(f"Error resolving single conflict: {e}")
            return {'resolved': False, 'reason': str(e)}
    
    async def _process_queued_transaction(self, transaction: Dict) -> bool:
        """Process a single queued transaction"""
        try:
            transaction_type = transaction.get('type')
            
            if transaction_type == 'sale':
                return await self._process_sale_transaction(transaction)
            elif transaction_type == 'customer_update':
                return await self._process_customer_transaction(transaction)
            elif transaction_type == 'product_update':
                return await self._process_product_transaction(transaction)
            
            return False
            
        except Exception as e:
            logger.error(f"Error processing queued transaction: {e}")
            return False
    
    async def _process_sale_transaction(self, transaction: Dict) -> bool:
        """Process a queued sale transaction"""
        try:
            db = next(get_db())
            
            # Create sale record
            sale_data = transaction['data']
            sale = Sale(**sale_data)
            
            db.add(sale)
            db.commit()
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing sale transaction: {e}")
            return False
        finally:
            db.close()
    
    async def _process_customer_transaction(self, transaction: Dict) -> bool:
        """Process a queued customer transaction"""
        try:
            db = next(get_db())
            
            customer_data = transaction['data']
            customer_id = customer_data.get('id')
            
            if customer_id:
                # Update existing customer
                customer = db.query(Customer).filter(Customer.id == customer_id).first()
                if customer:
                    for key, value in customer_data.items():
                        setattr(customer, key, value)
            else:
                # Create new customer
                customer = Customer(**customer_data)
                db.add(customer)
            
            db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error processing customer transaction: {e}")
            return False
        finally:
            db.close()
    
    async def _process_product_transaction(self, transaction: Dict) -> bool:
        """Process a queued product transaction"""
        try:
            db = next(get_db())
            
            product_data = transaction['data']
            product_id = product_data.get('id')
            
            if product_id:
                # Update existing product
                product = db.query(Product).filter(Product.id == product_id).first()
                if product:
                    for key, value in product_data.items():
                        setattr(product, key, value)
            else:
                # Create new product
                product = Product(**product_data)
                db.add(product)
            
            db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error processing product transaction: {e}")
            return False
        finally:
            db.close()
    
    async def _update_pending_sync_count(self):
        """Update pending sync count for current terminal"""
        try:
            queue = self._load_sync_queue()
            pending_count = len(queue)
            
            # Update terminal record
            # This would be implemented based on current terminal ID
            
        except Exception as e:
            logger.error(f"Error updating pending sync count: {e}")
    
    def _load_sync_queue(self) -> List[Dict]:
        """Load sync queue from file"""
        try:
            if os.path.exists(self.sync_queue_path):
                with open(self.sync_queue_path, 'r') as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Error loading sync queue: {e}")
            return []
    
    def _save_sync_queue(self, queue: List[Dict]):
        """Save sync queue to file"""
        try:
            with open(self.sync_queue_path, 'w') as f:
                json.dump(queue, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving sync queue: {e}")
    
    def _load_conflict_log(self) -> List[Dict]:
        """Load conflict log from file"""
        try:
            if os.path.exists(self.conflict_log_path):
                with open(self.conflict_log_path, 'r') as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Error loading conflict log: {e}")
            return []
    
    def _save_conflict_log(self, conflicts: List[Dict]):
        """Save conflict log to file"""
        try:
            with open(self.conflict_log_path, 'w') as f:
                json.dump(conflicts, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving conflict log: {e}")


# Global sync service instance
sync_service = SyncService()