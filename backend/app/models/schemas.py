"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class Parameters(BaseModel):
    """Ollama generation parameters."""
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    top_p: float = Field(0.9, ge=0.0, le=1.0)
    top_k: int = Field(40, ge=1, le=100)
    repeat_penalty: float = Field(1.1, ge=0.0, le=2.0)
    num_ctx: int = Field(2048, ge=128, le=8192)
    num_predict: int = Field(512, ge=1, le=4096)
    stream: bool = True
    seed: Optional[int] = None
    stop: List[str] = Field(default_factory=list)
    mirostat: int = Field(0, ge=0, le=2)
    mirostat_tau: float = Field(5.0, ge=0.0)
    mirostat_eta: float = Field(0.1, ge=0.0)
    num_thread: int = Field(4, ge=1, le=32)


class MessageSchema(BaseModel):
    """Message schema for API."""
    role: str
    content: str


class GenerateRequest(BaseModel):
    """Request schema for text generation."""
    model: str
    endpoint_type: str  # 'chat' or 'generate'
    messages: List[MessageSchema]
    parameters: Parameters
    session_id: Optional[str] = None


class GenerateResponse(BaseModel):
    """Response schema for text generation."""
    message: MessageSchema
    done: bool
    total_duration: Optional[int] = None
    load_duration: Optional[int] = None
    prompt_eval_count: Optional[int] = None
    eval_count: Optional[int] = None


class Model(BaseModel):
    """Model information schema."""
    name: str
    modified_at: str
    size: int
    digest: str
    details: Optional[Dict[str, Any]] = None


class ModelInfo(BaseModel):
    """Detailed model information."""
    modelfile: Optional[str] = None
    parameters: Optional[str] = None
    template: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class CreateSessionRequest(BaseModel):
    """Request to create a new session."""
    name: str
    model_name: str
    endpoint_type: str = "chat"


class SessionResponse(BaseModel):
    """Session response schema."""
    id: str
    name: str
    created_at: datetime
    updated_at: datetime
    model_name: str
    endpoint_type: str
    message_count: Optional[int] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Message response schema."""
    id: str
    role: str
    content: str
    timestamp: datetime
    parameters: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class SessionDetailResponse(BaseModel):
    """Detailed session with messages."""
    id: str
    name: str
    created_at: datetime
    updated_at: datetime
    model_name: str
    endpoint_type: str
    messages: List[MessageResponse]

    class Config:
        from_attributes = True


class UpdateSessionRequest(BaseModel):
    """Request to update session."""
    name: Optional[str] = None


class ParameterPresetResponse(BaseModel):
    """Parameter preset response."""
    id: int
    name: str
    description: Optional[str] = None
    parameters: Dict[str, Any]

    class Config:
        from_attributes = True


class ContextInfoResponse(BaseModel):
    """Context information response."""
    total_messages: int
    context_messages: int
    estimated_tokens: int
    context_limit: int
    usage_percentage: float


class ErrorResponse(BaseModel):
    """Error response schema."""
    detail: str
    error_code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
