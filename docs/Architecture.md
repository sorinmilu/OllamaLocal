# System Architecture

## Overview

The Ollama Web Interface is a single-page application (SPA) that provides a comprehensive web-based interface for interacting with a local Ollama instance. The system follows a modern three-tier architecture with a React frontend, FastAPI backend, and SQLite database.

**Created**: December 3, 2025  
**Version**: 1.0  
**Status**: Design Phase

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT TIER (Browser)                        │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              React SPA (TypeScript)                       │ │
│  │  ┌─────────────┬──────────────┬────────────────────────┐ │ │
│  │  │   Layout    │ Components   │   State Management     │ │ │
│  │  │  - Sidebar  │  - Chat      │   - Context API        │ │ │
│  │  │  - Header   │  - Models    │   - Custom Hooks       │ │ │
│  │  │  - Theme    │  - Parameters│                        │ │ │
│  │  └─────────────┴──────────────┴────────────────────────┘ │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │              Services Layer                         │ │ │
│  │  │  - API Client (Axios)                               │ │ │
│  │  │  - WebSocket Manager                                │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP/REST & WebSocket
                              │
┌─────────────────────────────┴─────────────────────────────────┐
│                    APPLICATION TIER                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              FastAPI Backend (Python)                   │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │  API Layer (REST + WebSocket)                     │ │ │
│  │  │  - /api/models/*                                  │ │ │
│  │  │  - /api/chat/*                                    │ │ │
│  │  │  - /api/sessions/*                                │ │ │
│  │  │  - /api/parameters/*                              │ │ │
│  │  │  - /api/export/*                                  │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │  Business Logic Layer                             │ │ │
│  │  │  ┌─────────────────┬──────────────────────────┐  │ │ │
│  │  │  │ OllamaService   │ SessionService           │  │ │ │
│  │  │  │ - list_models() │ - create_session()       │  │ │ │
│  │  │  │ - download()    │ - get_messages()         │  │ │ │
│  │  │  │ - generate()    │ - save_message()         │  │ │ │
│  │  │  │ - stream()      │ - delete_session()       │  │ │ │
│  │  │  └─────────────────┴──────────────────────────┘  │ │ │
│  │  │  ┌─────────────────┬──────────────────────────┐  │ │ │
│  │  │  │ ContextManager  │ ExportService            │  │ │ │
│  │  │  │ - calculate()   │ - generate_pdf()         │  │ │ │
│  │  │  │ - trim()        │                          │  │ │ │
│  │  │  └─────────────────┴──────────────────────────┘  │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  │  ┌───────────────────────────────────────────────────┐ │ │
│  │  │  Data Access Layer (SQLAlchemy ORM)               │ │ │
│  │  │  - Models: Session, Message, ParameterPreset      │ │ │
│  │  │  - Repositories: CRUD operations                  │ │ │
│  │  └───────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
                              │
                       SQLAlchemy ORM
                              │
┌─────────────────────────────┴─────────────────────────────────┐
│                        DATA TIER                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  SQLite Database                        │ │
│  │  ┌──────────────┬───────────────┬───────────────────┐  │ │
│  │  │   sessions   │    messages   │ parameter_presets │  │ │
│  │  └──────────────┴───────────────┴───────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
                              │
                         HTTP Client
                              │
┌─────────────────────────────┴─────────────────────────────────┐
│                   EXTERNAL SERVICE                            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          Ollama Instance (localhost:11434)              │ │
│  │  - Model Management                                     │ │
│  │  - Text Generation                                      │ │
│  │  - Embeddings                                           │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Frontend Architecture

#### 1.1 Technology Stack
- **React 18+** with **TypeScript** for type safety
- **Vite** as build tool and dev server
- **React Bootstrap** for UI components
- **React Context API** for state management
- **Axios** for HTTP requests
- **WebSocket API** for streaming responses

#### 1.2 Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx          # Main application layout
│   │   ├── Sidebar.tsx            # Collapsible navigation menu
│   │   ├── Header.tsx             # Top header with theme toggle
│   │   └── Footer.tsx             # Footer component
│   ├── chat/
│   │   ├── ChatInterface.tsx      # Main chat container
│   │   ├── MessageList.tsx        # Display messages
│   │   ├── Message.tsx            # Individual message component
│   │   ├── InputArea.tsx          # User input field
│   │   ├── SessionTabs.tsx        # Multiple session tabs
│   │   └── ContextIndicator.tsx   # Context usage display
│   ├── models/
│   │   ├── ModelSelector.tsx      # Model dropdown selector
│   │   ├── ModelManager.tsx       # Model management panel
│   │   ├── ModelDownload.tsx      # Download interface
│   │   ├── ModelList.tsx          # List of models
│   │   └── DownloadProgress.tsx   # Progress bar
│   └── parameters/
│       ├── ParameterPanel.tsx     # Main parameter configuration
│       ├── ParameterSlider.tsx    # Slider input component
│       ├── ParameterCheckbox.tsx  # Checkbox input
│       ├── PresetSelector.tsx     # Preset dropdown
│       └── EndpointSelector.tsx   # API endpoint switcher
├── contexts/
│   ├── ThemeContext.tsx           # Light/dark theme state
│   ├── SessionContext.tsx         # Current session state
│   └── ModelContext.tsx           # Selected model state
├── hooks/
│   ├── useOllamaAPI.ts           # Ollama API operations
│   ├── useWebSocket.ts           # WebSocket connection
│   ├── useSession.ts             # Session management
│   └── useLocalStorage.ts        # Persist settings
├── services/
│   ├── api.ts                    # Axios instance & interceptors
│   ├── websocket.ts              # WebSocket manager
│   └── export.ts                 # Export functionality
├── types/
│   ├── models.ts                 # Type definitions
│   ├── session.ts
│   └── parameters.ts
└── utils/
    ├── tokenCounter.ts           # Estimate token count
    ├── dateFormatter.ts          # Date utilities
    └── validators.ts             # Input validation
```

#### 1.3 State Management Strategy

**Global State** (Context API):
- Theme (light/dark)
- Current active session
- Selected model
- WebSocket connection status

**Local Component State**:
- Form inputs
- UI interactions (collapse/expand)
- Loading states

**Server State** (via React Query - optional future enhancement):
- Model list
- Session history
- Messages

---

### 2. Backend Architecture

#### 2.1 Technology Stack
- **FastAPI** framework (async/await support)
- **SQLAlchemy 2.0** ORM with async support
- **Pydantic** for data validation
- **httpx** for async HTTP client (Ollama communication)
- **ReportLab** or **WeasyPrint** for PDF generation
- **python-multipart** for file uploads
- **uvicorn** as ASGI server

#### 2.2 Service Layer

**OllamaService** (`app/services/ollama_service.py`):
```python
class OllamaService:
    async def list_models() -> List[Model]
    async def get_model_info(name: str) -> ModelInfo
    async def download_model(name: str) -> AsyncGenerator
    async def delete_model(name: str) -> bool
    async def generate(request: GenerateRequest) -> Response
    async def stream_generate(request: GenerateRequest) -> AsyncGenerator
    async def chat(request: ChatRequest) -> Response
    async def stream_chat(request: ChatRequest) -> AsyncGenerator
```

**SessionService** (`app/services/session_service.py`):
```python
class SessionService:
    async def create_session(name: str, model: str) -> Session
    async def get_session(id: str) -> Session
    async def list_sessions() -> List[Session]
    async def update_session(id: str, updates: dict) -> Session
    async def delete_session(id: str) -> bool
    async def add_message(session_id: str, message: Message) -> Message
    async def get_messages(session_id: str, limit: int) -> List[Message]
```

**ContextManager** (`app/services/context_manager.py`):
```python
class ContextManager:
    def calculate_tokens(messages: List[Message]) -> int
    def get_context_messages(messages: List[Message], limit: int) -> List[Message]
    def get_context_info(session_id: str) -> ContextInfo
```

**ExportService** (`app/services/export_service.py`):
```python
class ExportService:
    async def export_to_pdf(session_id: str) -> bytes
    def format_message(message: Message) -> str
```

#### 2.3 Data Models

**SQLAlchemy Models** (`app/models/database.py`):
```python
class Session(Base):
    id: UUID (PK)
    name: str
    created_at: datetime
    updated_at: datetime
    model_name: str
    endpoint_type: str
    messages: relationship -> List[Message]

class Message(Base):
    id: UUID (PK)
    session_id: UUID (FK)
    role: str (user/assistant/system)
    content: text
    timestamp: datetime
    parameters: JSON

class ParameterPreset(Base):
    id: int (PK)
    name: str
    description: str
    parameters: JSON
```

**Pydantic Schemas** (`app/models/schemas.py`):
```python
class GenerateRequest(BaseModel):
    model: str
    endpoint_type: str
    messages: List[Message]
    parameters: Parameters
    session_id: Optional[UUID]

class Parameters(BaseModel):
    temperature: float = 0.7
    top_p: float = 0.9
    top_k: int = 40
    # ... all Ollama parameters with validation
```

---

### 3. Database Architecture

#### 3.1 Schema Design

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_name TEXT NOT NULL,
    endpoint_type TEXT NOT NULL
);

CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parameters TEXT, -- JSON
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE parameter_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parameters TEXT NOT NULL -- JSON
);

CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_sessions_updated ON sessions(updated_at);
```

#### 3.2 Database Operations

- **Connection**: SQLite file-based database (`ollama_web.db`)
- **Connection Pool**: SQLAlchemy async engine with connection pooling
- **Migrations**: Alembic for schema migrations (future enhancement)
- **Backup**: Simple file-based backup strategy

---

## Data Flow

### 4.1 Chat Generation Flow

```
1. User types message → InputArea component
2. Message sent to SessionContext
3. Frontend calls POST /api/chat/generate
4. Backend validates request (Pydantic)
5. SessionService saves user message to DB
6. OllamaService forwards to Ollama instance
7. Response streamed back via WebSocket
8. Frontend updates MessageList in real-time
9. SessionService saves assistant response to DB
10. ContextIndicator updates token count
```

### 4.2 Model Download Flow

```
1. User enters model name → ModelDownload component
2. Frontend calls POST /api/models/download
3. Backend initiates download from Ollama
4. Progress events streamed to frontend
5. DownloadProgress component shows progress bar
6. On completion, ModelSelector refreshes list
```

### 4.3 Session Management Flow

```
1. User clicks "New Session" → SessionTabs component
2. Frontend calls POST /api/sessions
3. Backend creates session in database
4. Session added to active tabs
5. User switches tabs → GET /api/sessions/{id}
6. Backend retrieves last N messages (context_size)
7. Messages displayed in MessageList
```

---

## Security Considerations

### 5.1 Current Implementation
- **No authentication** (single-user, local deployment)
- **No encryption** (HTTP on localhost)
- **CORS enabled** for local development
- **Input validation** via Pydantic models

### 5.2 Future Enhancements
- Add authentication (JWT tokens)
- HTTPS support
- Rate limiting per user
- API key management
- Session encryption

---

## Performance Considerations

### 6.1 Frontend Optimization
- **Code splitting**: Lazy load components
- **Memoization**: React.memo for expensive components
- **Virtualization**: Virtual scrolling for long message lists
- **Debouncing**: Parameter changes debounced before API calls

### 6.2 Backend Optimization
- **Async operations**: All I/O operations use async/await
- **Connection pooling**: Database connection reuse
- **Streaming**: Large responses streamed via WebSocket
- **Caching**: Model list cached with TTL (future)

### 6.3 Database Optimization
- **Indexes**: On frequently queried fields
- **Pagination**: Limit message retrieval
- **Cascade deletes**: Automatic cleanup of related records

---

## Deployment Architecture

### 7.1 Development Environment
```
Frontend: npm run dev (Vite dev server on port 5173)
Backend: uvicorn main:app --reload (on port 8000)
Database: SQLite file in project root
Ollama: Running on localhost:11434
```

### 7.2 Production Deployment (Future)
```
Frontend: Static files served by Nginx
Backend: Uvicorn with Gunicorn process manager
Database: SQLite with regular backups
Reverse Proxy: Nginx routing to backend
```

---

## Error Handling Strategy

### 8.1 Frontend
- Try-catch blocks around API calls
- User-friendly error messages
- Retry logic for network failures
- Fallback UI for component errors (Error Boundaries)

### 8.2 Backend
- Custom exception handlers in FastAPI
- Structured error responses
- Logging with different levels
- Graceful degradation when Ollama unavailable

---

## Configuration Management

### 9.1 Frontend Configuration
- Environment variables (.env files)
- API base URL configurable
- Theme preferences in localStorage
- Parameter defaults configurable

### 9.2 Backend Configuration
```python
# config.py
OLLAMA_BASE_URL = "http://localhost:11434"
DATABASE_URL = "sqlite+aiosqlite:///./ollama_web.db"
CONTEXT_SIZE_DEFAULT = 10
CORS_ORIGINS = ["http://localhost:5173"]
```

---

## Testing Strategy

### 10.1 Frontend Testing (Future)
- Unit tests: Jest + React Testing Library
- Component tests: User interaction flows
- E2E tests: Playwright or Cypress

### 10.2 Backend Testing (Future)
- Unit tests: pytest
- Integration tests: Test database operations
- API tests: Test all endpoints with pytest-fastapi

---

## Monitoring & Logging

### 11.1 Logging
- **Frontend**: Console logging in development
- **Backend**: Python logging module with file output
- **Ollama**: Log all requests/responses for debugging

### 11.2 Metrics (Future)
- Response times
- Token usage per session
- Model download success rates
- Error rates by endpoint

---

## Technology Choices Rationale

### React + TypeScript
- Strong typing prevents runtime errors
- Large ecosystem and community support
- Component-based architecture promotes reusability

### FastAPI + Python
- Async support for streaming responses
- Automatic API documentation (Swagger/OpenAPI)
- Excellent for ML/AI applications
- Pydantic validation reduces boilerplate

### SQLite
- Zero configuration
- Single file database (easy backup)
- Sufficient for single-user application
- Can migrate to PostgreSQL if needed

### Bootstrap
- Proven UI framework
- Responsive out of the box
- Consistent design language
- Easy theming support

---

## Future Architecture Enhancements

1. **Multi-user Support**: Add authentication and user isolation
2. **Distributed Deployment**: Support multiple Ollama instances
3. **Real-time Collaboration**: Share sessions between users
4. **Plugin System**: Allow custom extensions
5. **Advanced Analytics**: Track usage patterns and optimize
6. **Cloud Storage**: Optional cloud backup for conversations
7. **Mobile App**: React Native mobile client
8. **Voice Interface**: Add speech-to-text/text-to-speech

---

**Document Version**: 1.0  
**Last Updated**: December 3, 2025  
**Status**: Design Phase - Not Yet Implemented
