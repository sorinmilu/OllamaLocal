# API Reference

## Overview

This document describes the REST API endpoints for the Ollama Web Interface. The backend API is built with FastAPI and provides endpoints for model management, chat operations, session management, and export functionality.

**Base URL**: `http://localhost:8000/api`

---

## Authentication

Currently, no authentication is required (single-user mode).

---

## Endpoints

### Models

#### GET `/api/models`

List all available models from the Ollama instance.

**Response**:
```json
{
  "models": [
    {
      "name": "llama2:latest",
      "modified_at": "2024-01-15T10:30:00Z",
      "size": 3825819519,
      "digest": "sha256:...",
      "details": {
        "format": "gguf",
        "family": "llama",
        "parameter_size": "7B"
      }
    }
  ]
}
```

#### POST `/api/models/download`

Download a new model from Ollama.

**Request**:
```json
{
  "model_name": "llama2:latest"
}
```

**Response** (Streaming):
```json
{"status": "pulling manifest"}
{"status": "downloading", "completed": 1024000, "total": 3825819519}
{"status": "verifying sha256 digest"}
{"status": "success"}
```

#### DELETE `/api/models/{model_name}`

Delete a model from the Ollama instance.

**Response**:
```json
{
  "success": true,
  "message": "Model deleted successfully"
}
```

#### GET `/api/models/{model_name}/info`

Get detailed information about a specific model.

**Response**:
```json
{
  "modelfile": "...",
  "parameters": "...",
  "template": "...",
  "details": {
    "format": "gguf",
    "family": "llama",
    "parameter_size": "7B",
    "quantization_level": "Q4_0"
  }
}
```

---

### Chat & Generation

#### POST `/api/chat/generate`

Generate a response using the specified endpoint type.

**Request**:
```json
{
  "model": "llama2:latest",
  "endpoint_type": "chat",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "parameters": {
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 40,
    "repeat_penalty": 1.1,
    "num_ctx": 2048,
    "num_predict": 512,
    "stream": true,
    "seed": null,
    "stop": [],
    "mirostat": 0,
    "mirostat_tau": 5.0,
    "mirostat_eta": 0.1,
    "num_thread": 8
  },
  "session_id": "uuid-here"
}
```

**Response** (Non-streaming):
```json
{
  "message": {
    "role": "assistant",
    "content": "Hello! How can I help you today?"
  },
  "done": true,
  "total_duration": 1500000000,
  "load_duration": 100000000,
  "prompt_eval_count": 10,
  "eval_count": 50
}
```

**Response** (Streaming via WebSocket):
```json
{"message": {"role": "assistant", "content": "Hello"}}
{"message": {"role": "assistant", "content": "!"}}
{"done": true, "total_duration": 1500000000}
```

#### WebSocket `/api/chat/stream`

WebSocket endpoint for streaming chat responses.

**Message Format** (Client → Server):
```json
{
  "action": "generate",
  "model": "llama2:latest",
  "endpoint_type": "chat",
  "messages": [...],
  "parameters": {...},
  "session_id": "uuid-here"
}
```

**Message Format** (Server → Client):
```json
{"type": "chunk", "content": "Hello"}
{"type": "done", "stats": {...}}
{"type": "error", "message": "Error description"}
```

---

### Sessions

#### GET `/api/sessions`

List all conversation sessions.

**Response**:
```json
{
  "sessions": [
    {
      "id": "uuid-1",
      "name": "My Conversation",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z",
      "model_name": "llama2:latest",
      "endpoint_type": "chat",
      "message_count": 10
    }
  ]
}
```

#### POST `/api/sessions`

Create a new conversation session.

**Request**:
```json
{
  "name": "New Conversation",
  "model_name": "llama2:latest",
  "endpoint_type": "chat"
}
```

**Response**:
```json
{
  "id": "uuid-new",
  "name": "New Conversation",
  "created_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z",
  "model_name": "llama2:latest",
  "endpoint_type": "chat"
}
```

#### GET `/api/sessions/{session_id}`

Get a specific session with its messages.

**Query Parameters**:
- `context_size` (optional, default: 10): Number of recent messages to include in context

**Response**:
```json
{
  "id": "uuid-1",
  "name": "My Conversation",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z",
  "model_name": "llama2:latest",
  "endpoint_type": "chat",
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-15T10:00:00Z",
      "parameters": {...}
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Hi there!",
      "timestamp": "2024-01-15T10:00:05Z",
      "parameters": null
    }
  ]
}
```

#### PUT `/api/sessions/{session_id}`

Update a session (e.g., rename).

**Request**:
```json
{
  "name": "Updated Name"
}
```

**Response**:
```json
{
  "id": "uuid-1",
  "name": "Updated Name",
  "updated_at": "2024-01-15T12:30:00Z"
}
```

#### DELETE `/api/sessions/{session_id}`

Delete a session and all its messages.

**Response**:
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

#### GET `/api/sessions/{session_id}/context-info`

Get context window information for a session.

**Response**:
```json
{
  "total_messages": 50,
  "context_messages": 10,
  "estimated_tokens": 1024,
  "context_limit": 2048,
  "usage_percentage": 50.0
}
```

---

### Parameters

#### GET `/api/parameters/presets`

Get all parameter presets.

**Response**:
```json
{
  "presets": [
    {
      "id": 1,
      "name": "Creative Writing",
      "description": "High creativity, diverse outputs",
      "parameters": {
        "temperature": 0.9,
        "top_p": 0.95,
        "top_k": 50,
        "repeat_penalty": 1.1
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
        "repeat_penalty": 1.2
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
        "repeat_penalty": 1.1
      }
    },
    {
      "id": 4,
      "name": "Fast Response",
      "description": "Optimized for speed",
      "parameters": {
        "temperature": 0.7,
        "num_predict": 256,
        "num_thread": 8
      }
    }
  ]
}
```

#### GET `/api/parameters/defaults`

Get default parameter values.

**Response**:
```json
{
  "temperature": 0.7,
  "top_p": 0.9,
  "top_k": 40,
  "repeat_penalty": 1.1,
  "num_ctx": 2048,
  "num_predict": 512,
  "stream": true,
  "seed": null,
  "stop": [],
  "mirostat": 0,
  "mirostat_tau": 5.0,
  "mirostat_eta": 0.1,
  "num_thread": 4
}
```

#### POST `/api/parameters/validate`

Validate parameter values.

**Request**:
```json
{
  "temperature": 0.7,
  "top_p": 0.9,
  "invalid_param": "value"
}
```

**Response**:
```json
{
  "valid": false,
  "errors": {
    "invalid_param": "Unknown parameter"
  }
}
```

---

### Export

#### POST `/api/export/pdf`

Export a conversation session to PDF.

**Request**:
```json
{
  "session_id": "uuid-1"
}
```

**Response**:
Binary PDF file with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="conversation_2024-01-15.pdf"
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "detail": "Error message description",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `502 Bad Gateway`: Cannot connect to Ollama instance
- `503 Service Unavailable`: Ollama instance not available

---

## Rate Limiting

Currently, no rate limiting is implemented (single-user mode).

---

## Ollama Instance Configuration

The API expects Ollama to be running at: `http://localhost:11434`

This can be configured in the backend `config.py` file.
