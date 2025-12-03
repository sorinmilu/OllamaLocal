"""
API routes for parameter management.
"""
from fastapi import APIRouter
from typing import List, Dict, Any
from app.models.schemas import ParameterPresetResponse, Parameters
from app.config import settings

router = APIRouter(prefix="/api/parameters", tags=["parameters"])

# Default parameter presets
PRESETS = [
    {
        "id": 1,
        "name": "Creative Writing",
        "description": "High creativity, diverse outputs",
        "parameters": {
            "temperature": 0.9,
            "top_p": 0.95,
            "top_k": 50,
            "repeat_penalty": 1.1,
            "num_ctx": 2048,
            "num_predict": 512,
            "stream": True,
            "num_thread": 4
        }
    },
    {
        "id": 2,
        "name": "Precise/Technical",
        "description": "Focused, deterministic responses",
        "parameters": {
            "temperature": 0.3,
            "top_p": 0.5,
            "top_k": 20,
            "repeat_penalty": 1.2,
            "num_ctx": 2048,
            "num_predict": 512,
            "stream": True,
            "num_thread": 4
        }
    },
    {
        "id": 3,
        "name": "Balanced",
        "description": "Recommended default settings",
        "parameters": {
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40,
            "repeat_penalty": 1.1,
            "num_ctx": 2048,
            "num_predict": 512,
            "stream": True,
            "num_thread": 4
        }
    },
    {
        "id": 4,
        "name": "Fast Response",
        "description": "Optimized for speed",
        "parameters": {
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40,
            "repeat_penalty": 1.1,
            "num_ctx": 2048,
            "num_predict": 256,
            "stream": True,
            "num_thread": 8
        }
    }
]


@router.get("/presets", response_model=List[ParameterPresetResponse])
async def get_presets():
    """Get all parameter presets."""
    return [ParameterPresetResponse(**preset) for preset in PRESETS]


@router.get("/defaults", response_model=Parameters)
async def get_defaults():
    """Get default parameter values."""
    return Parameters(
        temperature=settings.DEFAULT_TEMPERATURE,
        top_p=settings.DEFAULT_TOP_P,
        top_k=settings.DEFAULT_TOP_K,
        repeat_penalty=settings.DEFAULT_REPEAT_PENALTY,
        num_ctx=settings.DEFAULT_NUM_CTX,
        num_predict=settings.DEFAULT_NUM_PREDICT,
        stream=True,
        num_thread=settings.DEFAULT_NUM_THREAD
    )


@router.post("/validate")
async def validate_parameters(parameters: Dict[str, Any]):
    """Validate parameter values."""
    try:
        # Try to create Parameters object for validation
        Parameters(**parameters)
        return {"valid": True}
    except Exception as e:
        return {
            "valid": False,
            "errors": str(e)
        }
