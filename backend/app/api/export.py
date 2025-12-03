"""
API routes for exporting conversations.
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.session_service import SessionService
from app.services.export_service import ExportService
from datetime import datetime

router = APIRouter(prefix="/api/export", tags=["export"])


@router.post("/pdf")
async def export_pdf(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """Export a conversation session to PDF."""
    session_id = request.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    
    session_service = SessionService(db)
    
    # Get session
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get all messages
    messages = await session_service.get_messages(session_id)
    
    # Generate PDF
    pdf_bytes = ExportService.export_to_pdf(session, messages)
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"conversation_{timestamp}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
