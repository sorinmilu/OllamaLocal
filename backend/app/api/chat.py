"""
API routes for chat and generation.
"""
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.ollama_service import ollama_service
from app.services.session_service import SessionService
from app.models.schemas import GenerateRequest, GenerateResponse, MessageSchema
import json

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/generate")
async def generate(
    request: GenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate a response (streaming or non-streaming)."""
    try:
        session_service = SessionService(db)
        
        # Save user message if session_id provided
        if request.session_id:
            user_message = request.messages[-1]
            await session_service.add_message(
                request.session_id,
                user_message.role,
                user_message.content,
                request.parameters.dict()
            )
        
        # Choose endpoint based on type and streaming
        if request.parameters.stream:
            # Streaming response
            async def generate_stream():
                full_content = ""
                try:
                    if request.endpoint_type == "chat":
                        async for chunk in ollama_service.stream_chat(request):
                            # Accumulate content for saving
                            if "message" in chunk and "content" in chunk["message"]:
                                full_content += chunk["message"]["content"]
                            yield json.dumps(chunk) + "\n"
                    else:
                        async for chunk in ollama_service.stream_generate(request):
                            if "response" in chunk:
                                full_content += chunk["response"]
                            yield json.dumps(chunk) + "\n"
                    
                    # Save assistant response if session_id provided
                    if request.session_id and full_content:
                        await session_service.add_message(
                            request.session_id,
                            "assistant",
                            full_content
                        )
                except Exception as e:
                    yield json.dumps({"error": str(e)}) + "\n"
            
            return StreamingResponse(generate_stream(), media_type="application/x-ndjson")
        else:
            # Non-streaming response
            if request.endpoint_type == "chat":
                response = await ollama_service.chat(request)
            else:
                response = await ollama_service.generate(request)
            
            # Save assistant response if session_id provided
            if request.session_id:
                content = response.get("message", {}).get("content") or response.get("response", "")
                if content:
                    await session_service.add_message(
                        request.session_id,
                        "assistant",
                        content
                    )
            
            return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for streaming chat."""
    await websocket.accept()
    
    try:
        while True:
            # Receive request
            data = await websocket.receive_json()
            
            action = data.get("action")
            if action == "generate":
                try:
                    request = GenerateRequest(**data)
                    
                    # Stream response
                    if request.endpoint_type == "chat":
                        async for chunk in ollama_service.stream_chat(request):
                            await websocket.send_json({
                                "type": "chunk",
                                "data": chunk
                            })
                    else:
                        async for chunk in ollama_service.stream_generate(request):
                            await websocket.send_json({
                                "type": "chunk",
                                "data": chunk
                            })
                    
                    # Send completion
                    await websocket.send_json({"type": "done"})
                    
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "message": str(e)
                    })
            
    except WebSocketDisconnect:
        pass
