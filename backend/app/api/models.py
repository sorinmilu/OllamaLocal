"""
API routes for model management.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from app.services.ollama_service import ollama_service
from app.models.schemas import Model, ModelInfo
import json

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("", response_model=List[Model])
async def list_models():
    """Get list of all available models."""
    try:
        models = await ollama_service.list_models()
        return models
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to connect to Ollama: {str(e)}")


@router.get("/{model_name}/info", response_model=ModelInfo)
async def get_model_info(model_name: str):
    """Get detailed information about a specific model."""
    try:
        info = await ollama_service.get_model_info(model_name)
        return info
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Model not found: {str(e)}")


@router.post("/download")
async def download_model(request: dict):
    """Download a model with streaming progress updates."""
    model_name = request.get("model_name")
    if not model_name:
        raise HTTPException(status_code=400, detail="model_name is required")
    
    async def generate():
        try:
            async for progress in ollama_service.download_model(model_name):
                yield json.dumps(progress) + "\n"
        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"
    
    return StreamingResponse(generate(), media_type="application/x-ndjson")


@router.delete("/{model_name}")
async def delete_model(model_name: str):
    """Delete a model from Ollama."""
    try:
        await ollama_service.delete_model(model_name)
        return {"success": True, "message": "Model deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")
