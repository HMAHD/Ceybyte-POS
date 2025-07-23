"""
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        CEYBYTE POS                                               │
│                                                                                                  │
│                                   Session Management API Routes                                  │
│                                                                                                  │
│  Description: FastAPI routes for session management, active session tracking, login history,    │
│               and audit logging. Supports multi-terminal session management.                     │
│                                                                                                  │
│  Author: Akash Hasendra                                                                          │
│  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
│  License: MIT License with Sri Lankan Business Terms                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy import and_, or_, desc, func
from sqlalchemy.exc import IntegrityError

from database.connection import SessionLocal
from models.user import User
from models.auth_session import AuthSession
from models.audit_log import AuditLog
from utils.auth import (
    get_current_user_from_token, 
    log_security_event,
    USER_ROLES
)

router = APIRouter(prefix="/sessions", tags=["session-management"])
security = HTTPBearer()

# Request/Response Models
class SessionResponse(BaseModel):
    id: int
    user_id: int
    username: str
    user_name: str
    user_role: str
    terminal_name: Optional[str]
    ip_address: Optional[str]
    user_agent: Optional[str]
    login_time: str
    last_activity: Optional[str]
    is_active: bool
    session_duration: Optional[int]  # in minutes
    location: Optional[str]

class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
    total: int
    active_count: int
    page: int
    per_page: int

class LoginHistoryResponse(BaseModel):
    id: int
    user_id: int
    username: str
    user_name: str
    login_time: str
    logout_time: Optional[str]
    session_duration: Optional[int]  # in minutes
    terminal_name: Optional[str]
    ip_address: Optional[str]
    login_method: str  # 'password' or 'pin'
    logout_reason: Optional[str]  # 'manual', 'timeout', 'forced', 'system'

class LoginHistoryListResponse(BaseModel):
    history: List[LoginHistoryResponse]
    total: int
    page: int
    per_page: int

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    username: Optional[str]
    event_type: str
    description: str
    severity: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    terminal_name: Optional[str]
    metadata: Optional[dict]
    timestamp: str

class AuditLogListResponse(BaseModel):
    logs: List[AuditLogResponse]
    total: int
    page: int
    per_page: int

class ForceLogoutRequest(BaseModel):
    session_ids: List[int]
    reason: str = "Administrative action"

class SessionTimeoutConfigRequest(BaseModel):
    timeout_minutes: int = Field(..., ge=5, le=1440)  # 5 minutes to 24 hours
    warning_minutes: int = Field(..., ge=1, le=60)    # 1 minute to 1 hour

def require_admin_access(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to require admin access (owner role)"""
    user = get_current_user_from_token(credentials.credentials)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    if user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user

def session_to_response(session: AuthSession) -> SessionResponse:
    """Convert AuthSession model to SessionResponse"""
    session_duration = None
    if session.login_time and session.last_activity:
        duration = session.last_activity - session.login_time
        session_duration = int(duration.total_seconds() / 60)
    
    return SessionResponse(
        id=session.id,
        user_id=session.user_id,
        username=session.user.username if session.user else "Unknown",
        user_name=session.user.name if session.user else "Unknown User",
        user_role=session.user.role if session.user else "unknown",
        terminal_name=session.terminal_name,
        ip_address=session.ip_address,
        user_agent=session.user_agent,
        login_time=session.login_time.isoformat() if session.login_time else "",
        last_activity=session.last_activity.isoformat() if session.last_activity else None,
        is_active=session.is_active,
        session_duration=session_duration,
        location=session.location
    )

@router.get("/active", response_model=SessionListResponse)
async def get_active_sessions(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    terminal: Optional[str] = Query(None, description="Filter by terminal name"),
    current_user: User = Depends(require_admin_access)
):
    """Get list of active sessions"""
    db = SessionLocal()
    try:
        query = db.query(AuthSession).filter(AuthSession.is_active == True)
        
        # Apply filters
        if user_id:
            query = query.filter(AuthSession.user_id == user_id)
        
        if terminal:
            query = query.filter(AuthSession.terminal_name.ilike(f"%{terminal}%"))
        
        # Get total count
        total = query.count()
        active_count = total  # All queried sessions are active
        
        # Apply pagination
        offset = (page - 1) * per_page
        sessions = query.order_by(desc(AuthSession.login_time)).offset(offset).limit(per_page).all()
        
        return SessionListResponse(
            sessions=[session_to_response(session) for session in sessions],
            total=total,
            active_count=active_count,
            page=page,
            per_page=per_page
        )
        
    finally:
        db.close()

@router.get("/history", response_model=LoginHistoryListResponse)
async def get_login_history(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    current_user: User = Depends(require_admin_access)
):
    """Get login/logout history"""
    db = SessionLocal()
    try:
        # Get sessions from the last N days
        since_date = datetime.now() - timedelta(days=days)
        query = db.query(AuthSession).filter(AuthSession.login_time >= since_date)
        
        # Apply user filter
        if user_id:
            query = query.filter(AuthSession.user_id == user_id)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        sessions = query.order_by(desc(AuthSession.login_time)).offset(offset).limit(per_page).all()
        
        history = []
        for session in sessions:
            session_duration = None
            if session.login_time and session.logout_time:
                duration = session.logout_time - session.login_time
                session_duration = int(duration.total_seconds() / 60)
            
            history.append(LoginHistoryResponse(
                id=session.id,
                user_id=session.user_id,
                username=session.user.username if session.user else "Unknown",
                user_name=session.user.name if session.user else "Unknown User",
                login_time=session.login_time.isoformat() if session.login_time else "",
                logout_time=session.logout_time.isoformat() if session.logout_time else None,
                session_duration=session_duration,
                terminal_name=session.terminal_name,
                ip_address=session.ip_address,
                login_method=session.login_method or "password",
                logout_reason=session.logout_reason
            ))
        
        return LoginHistoryListResponse(
            history=history,
            total=total,
            page=page,
            per_page=per_page
        )
        
    finally:
        db.close()

@router.post("/force-logout")
async def force_logout_sessions(
    request: ForceLogoutRequest,
    current_user: User = Depends(require_admin_access)
):
    """Force logout specific sessions"""
    db = SessionLocal()
    try:
        # Get the sessions to logout
        sessions = db.query(AuthSession).filter(
            AuthSession.id.in_(request.session_ids),
            AuthSession.is_active == True
        ).all()
        
        if not sessions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active sessions found with the provided IDs"
            )
        
        # Force logout each session
        for session in sessions:
            session.is_active = False
            session.logout_time = datetime.now()
            session.logout_reason = "forced"
            
            # Log security event
            log_security_event(
                event_type="forced_logout",
                user_id=current_user.id,
                description=f"Forced logout of session {session.id} for user {session.user.username if session.user else 'Unknown'}",
                severity="warning",
                metadata={
                    "session_id": session.id,
                    "target_user_id": session.user_id,
                    "reason": request.reason,
                    "admin_user": current_user.username
                }
            )
        
        db.commit()
        
        return {
            "message": f"Successfully logged out {len(sessions)} session(s)",
            "logged_out_sessions": len(sessions)
        }
        
    finally:
        db.close()

@router.get("/audit-logs", response_model=AuditLogListResponse)
async def get_audit_logs(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    current_user: User = Depends(require_admin_access)
):
    """Get audit logs"""
    db = SessionLocal()
    try:
        # Get logs from the last N days
        since_date = datetime.now() - timedelta(days=days)
        query = db.query(AuditLog).filter(AuditLog.timestamp >= since_date)
        
        # Apply filters
        if event_type:
            query = query.filter(AuditLog.event_type == event_type)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        
        if severity:
            query = query.filter(AuditLog.severity == severity)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        logs = query.order_by(desc(AuditLog.timestamp)).offset(offset).limit(per_page).all()
        
        audit_logs = []
        for log in logs:
            audit_logs.append(AuditLogResponse(
                id=log.id,
                user_id=log.user_id,
                username=log.user.username if log.user else None,
                event_type=log.event_type,
                description=log.description,
                severity=log.severity,
                ip_address=log.ip_address,
                user_agent=log.user_agent,
                terminal_name=log.terminal_name,
                metadata=log.metadata,
                timestamp=log.timestamp.isoformat()
            ))
        
        return AuditLogListResponse(
            logs=audit_logs,
            total=total,
            page=page,
            per_page=per_page
        )
        
    finally:
        db.close()

@router.get("/stats")
async def get_session_stats(
    current_user: User = Depends(require_admin_access)
):
    """Get session statistics"""
    db = SessionLocal()
    try:
        # Active sessions
        active_sessions = db.query(AuthSession).filter(AuthSession.is_active == True).count()
        
        # Total sessions today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_sessions = db.query(AuthSession).filter(AuthSession.login_time >= today_start).count()
        
        # Sessions by role (active)
        role_stats = db.query(
            User.role,
            func.count(AuthSession.id).label('count')
        ).join(AuthSession).filter(AuthSession.is_active == True).group_by(User.role).all()
        
        # Failed login attempts today
        failed_logins = db.query(AuditLog).filter(
            AuditLog.event_type == "login_failed",
            AuditLog.timestamp >= today_start
        ).count()
        
        # Average session duration (completed sessions in last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        completed_sessions = db.query(AuthSession).filter(
            AuthSession.login_time >= week_ago,
            AuthSession.logout_time.isnot(None)
        ).all()
        
        avg_duration = 0
        if completed_sessions:
            total_duration = sum([
                (session.logout_time - session.login_time).total_seconds() / 60
                for session in completed_sessions
            ])
            avg_duration = int(total_duration / len(completed_sessions))
        
        return {
            "active_sessions": active_sessions,
            "today_sessions": today_sessions,
            "failed_logins_today": failed_logins,
            "average_session_duration_minutes": avg_duration,
            "sessions_by_role": {role: count for role, count in role_stats},
            "timestamp": datetime.now().isoformat()
        }
        
    finally:
        db.close()

@router.delete("/cleanup")
async def cleanup_old_sessions(
    days: int = Query(90, ge=30, le=365, description="Delete sessions older than N days"),
    current_user: User = Depends(require_admin_access)
):
    """Clean up old inactive sessions"""
    db = SessionLocal()
    try:
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Count sessions to be deleted
        count = db.query(AuthSession).filter(
            AuthSession.is_active == False,
            AuthSession.logout_time < cutoff_date
        ).count()
        
        # Delete old sessions
        deleted = db.query(AuthSession).filter(
            AuthSession.is_active == False,
            AuthSession.logout_time < cutoff_date
        ).delete()
        
        db.commit()
        
        # Log the cleanup
        log_security_event(
            event_type="session_cleanup",
            user_id=current_user.id,
            description=f"Cleaned up {deleted} old sessions older than {days} days",
            severity="info",
            metadata={
                "deleted_count": deleted,
                "cutoff_days": days,
                "admin_user": current_user.username
            }
        )
        
        return {
            "message": f"Successfully cleaned up {deleted} old sessions",
            "deleted_count": deleted,
            "cutoff_date": cutoff_date.isoformat()
        }
        
    finally:
        db.close()