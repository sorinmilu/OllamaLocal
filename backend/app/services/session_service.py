"""
Service for managing conversation sessions and messages.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from app.models.database import Session, Message
from app.models.schemas import CreateSessionRequest, MessageSchema
from app.config import settings


class SessionService:
    """Service for session management operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session(self, request: CreateSessionRequest) -> Session:
        """
        Create a new conversation session.
        
        Args:
            request: Session creation request
        
        Returns:
            Created Session object
        """
        session = Session(
            name=request.name,
            model_name=request.model_name,
            endpoint_type=request.endpoint_type
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_session(self, session_id: str) -> Optional[Session]:
        """
        Get a session by ID.
        
        Args:
            session_id: Session UUID
        
        Returns:
            Session object or None
        """
        result = await self.db.execute(
            select(Session).where(Session.id == session_id)
        )
        return result.scalar_one_or_none()

    async def list_sessions(self) -> List[Session]:
        """
        Get all sessions, ordered by last update.
        
        Returns:
            List of Session objects
        """
        result = await self.db.execute(
            select(Session).order_by(Session.updated_at.desc())
        )
        return list(result.scalars().all())

    async def update_session(self, session_id: str, updates: dict) -> Optional[Session]:
        """
        Update session fields.
        
        Args:
            session_id: Session UUID
            updates: Dict of fields to update
        
        Returns:
            Updated Session object or None
        """
        session = await self.get_session(session_id)
        if not session:
            return None
        
        for key, value in updates.items():
            if hasattr(session, key):
                setattr(session, key, value)
        
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def delete_session(self, session_id: str) -> bool:
        """
        Delete a session and all its messages.
        
        Args:
            session_id: Session UUID
        
        Returns:
            True if deleted, False if not found
        """
        session = await self.get_session(session_id)
        if not session:
            return False
        
        await self.db.delete(session)
        await self.db.commit()
        return True

    async def add_message(
        self, 
        session_id: str, 
        role: str, 
        content: str,
        parameters: Optional[dict] = None
    ) -> Message:
        """
        Add a message to a session.
        
        Args:
            session_id: Session UUID
            role: Message role (user/assistant/system)
            content: Message content
            parameters: Optional parameters used for generation
        
        Returns:
            Created Message object
        """
        message = Message(
            session_id=session_id,
            role=role,
            content=content,
            parameters=parameters
        )
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        return message

    async def get_messages(
        self, 
        session_id: str, 
        limit: Optional[int] = None
    ) -> List[Message]:
        """
        Get messages for a session.
        
        Args:
            session_id: Session UUID
            limit: Max number of recent messages to return
        
        Returns:
            List of Message objects
        """
        query = (
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.timestamp.asc())
        )
        
        result = await self.db.execute(query)
        messages = list(result.scalars().all())
        
        # Return last N messages if limit specified
        if limit and len(messages) > limit:
            return messages[-limit:]
        
        return messages

    async def get_message_count(self, session_id: str) -> int:
        """
        Get count of messages in a session.
        
        Args:
            session_id: Session UUID
        
        Returns:
            Number of messages
        """
        result = await self.db.execute(
            select(func.count(Message.id))
            .where(Message.session_id == session_id)
        )
        return result.scalar() or 0
