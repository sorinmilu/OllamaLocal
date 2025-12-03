"""
API routes for session management.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.services.session_service import SessionService
from app.services.context_manager import ContextManager
from app.models.schemas import (
    CreateSessionRequest,
    SessionResponse,
    SessionDetailResponse,
    UpdateSessionRequest,
    MessageResponse,
    ContextInfoResponse
)
from app.config import settings

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("", response_model=List[SessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    """Get all conversation sessions."""
    session_service = SessionService(db)
    sessions = await session_service.list_sessions()
    
    # Add message count to each session
    result = []
    for session in sessions:
        count = await session_service.get_message_count(session.id)
        session_dict = {
            "id": session.id,
            "name": session.name,
            "created_at": session.created_at,
            "updated_at": session.updated_at,
            "model_name": session.model_name,
            "endpoint_type": session.endpoint_type,
            "message_count": count
        }
        result.append(SessionResponse(**session_dict))
    
    return result


@router.post("", response_model=SessionResponse)
async def create_session(
    request: CreateSessionRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create a new conversation session."""
    session_service = SessionService(db)
    session = await session_service.create_session(request)
    
    return SessionResponse(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        updated_at=session.updated_at,
        model_name=session.model_name,
        endpoint_type=session.endpoint_type,
        message_count=0
    )


@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session(
    session_id: str,
    context_size: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific session with its messages."""
    session_service = SessionService(db)
    session = await session_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get messages with optional limit
    limit = context_size or settings.DEFAULT_CONTEXT_SIZE
    messages = await session_service.get_messages(session_id, limit)
    
    message_responses = [
        MessageResponse(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            timestamp=msg.timestamp,
            parameters=msg.parameters
        )
        for msg in messages
    ]
    
    return SessionDetailResponse(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        updated_at=session.updated_at,
        model_name=session.model_name,
        endpoint_type=session.endpoint_type,
        messages=message_responses
    )


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: str,
    request: UpdateSessionRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update a session."""
    session_service = SessionService(db)
    
    updates = {}
    if request.name is not None:
        updates["name"] = request.name
    
    session = await session_service.update_session(session_id, updates)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    count = await session_service.get_message_count(session_id)
    
    return SessionResponse(
        id=session.id,
        name=session.name,
        created_at=session.created_at,
        updated_at=session.updated_at,
        model_name=session.model_name,
        endpoint_type=session.endpoint_type,
        message_count=count
    )


@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a session and all its messages."""
    session_service = SessionService(db)
    success = await session_service.delete_session(session_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"success": True, "message": "Session deleted successfully"}


@router.get("/{session_id}/context-info", response_model=ContextInfoResponse)
async def get_context_info(
    session_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get context window information for a session."""
    session_service = SessionService(db)
    session = await session_service.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get all messages for context calculation
    messages = await session_service.get_messages(session_id)
    
    # Get context messages based on default size
    context_messages = ContextManager.get_context_messages(
        messages,
        settings.DEFAULT_CONTEXT_SIZE
    )
    
    # Calculate context info
    context_info = ContextManager.get_context_info(context_messages)
    
    return ContextInfoResponse(
        total_messages=context_info["total_messages"],
        context_messages=len(context_messages),
        estimated_tokens=context_info["estimated_tokens"],
        context_limit=context_info["context_limit"],
        usage_percentage=context_info["usage_percentage"]
    )
