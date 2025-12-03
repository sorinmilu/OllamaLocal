# Core Reference

## Overview

This document provides detailed reference information for core functions, modules, and classes in the Ollama Web Interface application. It serves as a technical reference for developers working on the codebase.

**Created**: December 3, 2025  
**Version**: 1.0

---

## Frontend Core Reference

### 1. Services

#### 1.1 API Service (`src/services/api.ts`)

**Purpose**: Centralized HTTP client configuration and API request handling.

```typescript
// Axios instance configuration
const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (future)
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 502) {
      throw new Error('Ollama instance not available');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Key Functions**:

```typescript
// Get all models
export async function getModels(): Promise<Model[]>

// Download a model
export async function downloadModel(modelName: string): Promise<void>

// Delete a model
export async function deleteModel(modelName: string): Promise<void>

// Get model info
export async function getModelInfo(modelName: string): Promise<ModelInfo>

// Generate response
export async function generateResponse(request: GenerateRequest): Promise<GenerateResponse>

// Get all sessions
export async function getSessions(): Promise<Session[]>

// Create session
export async function createSession(data: CreateSessionRequest): Promise<Session>

// Get session with messages
export async function getSession(id: string, contextSize?: number): Promise<SessionDetail>

// Update session
export async function updateSession(id: string, updates: Partial<Session>): Promise<Session>

// Delete session
export async function deleteSession(id: string): Promise<void>

// Get parameter presets
export async function getParameterPresets(): Promise<ParameterPreset[]>

// Get default parameters
export async function getDefaultParameters(): Promise<Parameters>

// Export session to PDF
export async function exportSessionToPDF(sessionId: string): Promise<Blob>
```

---

#### 1.2 WebSocket Service (`src/services/websocket.ts`)

**Purpose**: Manage WebSocket connections for streaming chat responses.

```typescript
class WebSocketManager {
  private socket: WebSocket | null = null;
  private messageHandlers: Set<(message: any) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  connect(url: string): void {
    this.socket = new WebSocket(url);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messageHandlers.forEach(handler => handler(message));
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket closed');
      this.attemptReconnect(url);
    };
  }

  /**
   * Send message through WebSocket
   */
  send(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Subscribe to messages
   */
  subscribe(handler: (message: any) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    this.socket?.close();
    this.socket = null;
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(url), 1000 * this.reconnectAttempts);
    }
  }
}

export const wsManager = new WebSocketManager();
```

---

### 2. Custom Hooks

#### 2.1 useOllamaAPI Hook (`src/hooks/useOllamaAPI.ts`)

**Purpose**: React hook for Ollama API operations with loading and error states.

```typescript
interface UseOllamaAPIReturn {
  models: Model[];
  loading: boolean;
  error: string | null;
  fetchModels: () => Promise<void>;
  downloadModel: (name: string) => Promise<void>;
  deleteModel: (name: string) => Promise<void>;
}

export function useOllamaAPI(): UseOllamaAPIReturn {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getModels();
      setModels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadModel = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await downloadModelAPI(name);
      await fetchModels(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteModelAPI(name);
      await fetchModels(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { models, loading, error, fetchModels, downloadModel, deleteModel };
}
```

---

#### 2.2 useWebSocket Hook (`src/hooks/useWebSocket.ts`)

**Purpose**: React hook for WebSocket streaming with React lifecycle.

```typescript
interface UseWebSocketReturn {
  connected: boolean;
  sendMessage: (message: any) => void;
  subscribe: (handler: (message: any) => void) => () => void;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    wsManager.connect(url);
    setConnected(true);

    return () => {
      wsManager.disconnect();
      setConnected(false);
    };
  }, [url]);

  return {
    connected,
    sendMessage: (message) => wsManager.send(message),
    subscribe: (handler) => wsManager.subscribe(handler)
  };
}
```

---

#### 2.3 useSession Hook (`src/hooks/useSession.ts`)

**Purpose**: Manage session state and operations.

```typescript
interface UseSessionReturn {
  sessions: Session[];
  currentSession: Session | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  createSession: (name: string, model: string) => Promise<void>;
  switchSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  sendMessage: (content: string, parameters: Parameters) => Promise<void>;
}

export function useSession(): UseSessionReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const createSession = async (name: string, model: string) => {
    setLoading(true);
    try {
      const newSession = await createSessionAPI({ name, model_name: model, endpoint_type: 'chat' });
      setSessions([...sessions, newSession]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchSession = async (id: string) => {
    setLoading(true);
    try {
      const sessionDetail = await getSession(id);
      setCurrentSession(sessionDetail);
      setMessages(sessionDetail.messages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await deleteSessionAPI(id);
      setSessions(sessions.filter(s => s.id !== id));
      if (currentSession?.id === id) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = async (content: string, parameters: Parameters) => {
    if (!currentSession) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      parameters: null
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await generateResponse({
        model: currentSession.model_name,
        endpoint_type: currentSession.endpoint_type,
        messages: [...messages, userMessage],
        parameters,
        session_id: currentSession.id
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date().toISOString(),
        parameters: null
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    sessions,
    currentSession,
    messages,
    loading,
    error,
    createSession,
    switchSession,
    deleteSession,
    sendMessage
  };
}
```

---

### 3. Contexts

#### 3.1 Theme Context (`src/contexts/ThemeContext.tsx`)

**Purpose**: Manage application theme (light/dark mode).

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    document.body.setAttribute('data-bs-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

---

### 4. Utilities

#### 4.1 Token Counter (`src/utils/tokenCounter.ts`)

**Purpose**: Estimate token count for context management.

```typescript
/**
 * Rough estimation of tokens (1 token ≈ 4 characters)
 * For accurate counting, integrate tiktoken or similar
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate total tokens for a list of messages
 */
export function calculateMessageTokens(messages: Message[]): number {
  return messages.reduce((total, msg) => {
    return total + estimateTokens(msg.content) + 10; // +10 for role and formatting
  }, 0);
}

/**
 * Get context percentage usage
 */
export function getContextUsage(currentTokens: number, maxTokens: number): number {
  return (currentTokens / maxTokens) * 100;
}
```

---

## Backend Core Reference

### 5. Services

#### 5.1 Ollama Service (`app/services/ollama_service.py`)

**Purpose**: Interface with the local Ollama instance.

```python
import httpx
from typing import List, AsyncGenerator, Dict, Any
from app.models.schemas import Model, ModelInfo, GenerateRequest, ChatRequest

class OllamaService:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=60.0)

    async def list_models(self) -> List[Model]:
        """
        Get list of available models from Ollama.
        
        Returns:
            List of Model objects
        
        Raises:
            httpx.HTTPError: If Ollama is not reachable
        """
        response = await self.client.get(f"{self.base_url}/api/tags")
        response.raise_for_status()
        data = response.json()
        return [Model(**model) for model in data.get("models", [])]

    async def get_model_info(self, name: str) -> ModelInfo:
        """
        Get detailed information about a model.
        
        Args:
            name: Model name (e.g., "llama2:latest")
        
        Returns:
            ModelInfo object
        """
        response = await self.client.post(
            f"{self.base_url}/api/show",
            json={"name": name}
        )
        response.raise_for_status()
        return ModelInfo(**response.json())

    async def download_model(self, name: str) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Download a model with progress updates.
        
        Args:
            name: Model name to download
        
        Yields:
            Progress updates as dicts
        """
        async with self.client.stream(
            "POST",
            f"{self.base_url}/api/pull",
            json={"name": name},
            timeout=None
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line:
                    yield json.loads(line)

    async def delete_model(self, name: str) -> bool:
        """
        Delete a model from Ollama.
        
        Args:
            name: Model name to delete
        
        Returns:
            True if successful
        """
        response = await self.client.delete(
            f"{self.base_url}/api/delete",
            json={"name": name}
        )
        response.raise_for_status()
        return True

    async def generate(self, request: GenerateRequest) -> Dict[str, Any]:
        """
        Generate text using the generate endpoint.
        
        Args:
            request: GenerateRequest object
        
        Returns:
            Response dict from Ollama
        """
        payload = {
            "model": request.model,
            "prompt": request.messages[-1].content,
            "options": request.parameters.dict(exclude_none=True),
            "stream": False
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/generate",
            json=payload,
            timeout=None
        )
        response.raise_for_status()
        return response.json()

    async def stream_generate(self, request: GenerateRequest) -> AsyncGenerator[str, None]:
        """
        Stream text generation.
        
        Args:
            request: GenerateRequest object
        
        Yields:
            Text chunks as they are generated
        """
        payload = {
            "model": request.model,
            "prompt": request.messages[-1].content,
            "options": request.parameters.dict(exclude_none=True),
            "stream": True
        }
        
        async with self.client.stream(
            "POST",
            f"{self.base_url}/api/generate",
            json=payload,
            timeout=None
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line:
                    data = json.loads(line)
                    if "response" in data:
                        yield data["response"]

    async def chat(self, request: ChatRequest) -> Dict[str, Any]:
        """
        Chat using the chat endpoint.
        
        Args:
            request: ChatRequest object
        
        Returns:
            Response dict from Ollama
        """
        payload = {
            "model": request.model,
            "messages": [msg.dict() for msg in request.messages],
            "options": request.parameters.dict(exclude_none=True),
            "stream": False
        }
        
        response = await self.client.post(
            f"{self.base_url}/api/chat",
            json=payload,
            timeout=None
        )
        response.raise_for_status()
        return response.json()

    async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream chat responses.
        
        Args:
            request: ChatRequest object
        
        Yields:
            Message chunks as dicts
        """
        payload = {
            "model": request.model,
            "messages": [msg.dict() for msg in request.messages],
            "options": request.parameters.dict(exclude_none=True),
            "stream": True
        }
        
        async with self.client.stream(
            "POST",
            f"{self.base_url}/api/chat",
            json=payload,
            timeout=None
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line:
                    yield json.loads(line)
```

---

#### 5.2 Session Service (`app/services/session_service.py`)

**Purpose**: Manage conversation sessions and messages.

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from uuid import UUID
from app.models.database import Session, Message
from app.models.schemas import CreateSessionRequest, MessageCreate

class SessionService:
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

    async def get_session(self, session_id: UUID) -> Optional[Session]:
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
        return result.scalars().all()

    async def update_session(self, session_id: UUID, updates: dict) -> Session:
        """
        Update session fields.
        
        Args:
            session_id: Session UUID
            updates: Dict of fields to update
        
        Returns:
            Updated Session object
        """
        session = await self.get_session(session_id)
        if not session:
            raise ValueError("Session not found")
        
        for key, value in updates.items():
            setattr(session, key, value)
        
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def delete_session(self, session_id: UUID) -> bool:
        """
        Delete a session and all its messages.
        
        Args:
            session_id: Session UUID
        
        Returns:
            True if deleted
        """
        await self.db.execute(
            delete(Session).where(Session.id == session_id)
        )
        await self.db.commit()
        return True

    async def add_message(self, session_id: UUID, message: MessageCreate) -> Message:
        """
        Add a message to a session.
        
        Args:
            session_id: Session UUID
            message: Message to add
        
        Returns:
            Created Message object
        """
        db_message = Message(
            session_id=session_id,
            role=message.role,
            content=message.content,
            parameters=message.parameters
        )
        self.db.add(db_message)
        await self.db.commit()
        await self.db.refresh(db_message)
        return db_message

    async def get_messages(
        self, 
        session_id: UUID, 
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
        query = select(Message).where(Message.session_id == session_id).order_by(Message.timestamp)
        
        if limit:
            # Get last N messages
            query = query.limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
```

---

#### 5.3 Context Manager (`app/services/context_manager.py`)

**Purpose**: Manage conversation context and token counting.

```python
from typing import List
from app.models.database import Message

class ContextManager:
    """
    Manages conversation context and token estimation.
    """

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """
        Rough token estimation (1 token ≈ 4 characters).
        
        Args:
            text: Text to estimate
        
        Returns:
            Estimated token count
        """
        return len(text) // 4

    @staticmethod
    def calculate_message_tokens(messages: List[Message]) -> int:
        """
        Calculate total tokens for messages.
        
        Args:
            messages: List of messages
        
        Returns:
            Total estimated tokens
        """
        total = 0
        for msg in messages:
            total += ContextManager.estimate_tokens(msg.content)
            total += 10  # Role and formatting overhead
        return total

    @staticmethod
    def get_context_messages(
        messages: List[Message], 
        context_size: int
    ) -> List[Message]:
        """
        Get the last N messages for context.
        
        Args:
            messages: All messages in session
            context_size: Number of messages to include
        
        Returns:
            Last N messages
        """
        return messages[-context_size:] if context_size else messages

    @staticmethod
    def get_context_info(messages: List[Message], max_tokens: int = 2048) -> dict:
        """
        Get context usage information.
        
        Args:
            messages: List of messages
            max_tokens: Maximum context window size
        
        Returns:
            Dict with context statistics
        """
        total_tokens = ContextManager.calculate_message_tokens(messages)
        usage_pct = (total_tokens / max_tokens) * 100

        return {
            "total_messages": len(messages),
            "estimated_tokens": total_tokens,
            "context_limit": max_tokens,
            "usage_percentage": round(usage_pct, 2)
        }
```

---

#### 5.4 Export Service (`app/services/export_service.py`)

**Purpose**: Export conversations to PDF format.

```python
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import inch
from io import BytesIO
from typing import List
from app.models.database import Session, Message

class ExportService:
    """
    Export conversation sessions to various formats.
    """

    @staticmethod
    def export_to_pdf(session: Session, messages: List[Message]) -> bytes:
        """
        Export a conversation session to PDF.
        
        Args:
            session: Session object
            messages: List of messages
        
        Returns:
            PDF file as bytes
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title = Paragraph(f"<b>{session.name}</b>", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 0.2 * inch))

        # Metadata
        metadata = Paragraph(
            f"Model: {session.model_name}<br/>"
            f"Created: {session.created_at.strftime('%Y-%m-%d %H:%M')}<br/>"
            f"Messages: {len(messages)}",
            styles['Normal']
        )
        story.append(metadata)
        story.append(Spacer(1, 0.3 * inch))

        # Messages
        for msg in messages:
            role_style = styles['Heading3'] if msg.role == 'user' else styles['Heading4']
            role = Paragraph(f"<b>{msg.role.upper()}</b>", role_style)
            story.append(role)

            content = Paragraph(msg.content, styles['Normal'])
            story.append(content)
            story.append(Spacer(1, 0.2 * inch))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes
```

---

### 6. Database Models

#### 6.1 SQLAlchemy Models (`app/models/database.py`)

```python
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    model_name = Column(String, nullable=False)
    endpoint_type = Column(String, nullable=False)  # 'chat' or 'generate'

    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    parameters = Column(JSON, nullable=True)  # Store request parameters

    session = relationship("Session", back_populates="messages")

class ParameterPreset(Base):
    __tablename__ = "parameter_presets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    parameters = Column(JSON, nullable=False)
```

---

### 7. Pydantic Schemas

#### 7.1 Request/Response Models (`app/models/schemas.py`)

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class Parameters(BaseModel):
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    top_p: float = Field(0.9, ge=0.0, le=1.0)
    top_k: int = Field(40, ge=1, le=100)
    repeat_penalty: float = Field(1.1, ge=0.0, le=2.0)
    num_ctx: int = Field(2048, ge=128, le=8192)
    num_predict: int = Field(512, ge=1, le=4096)
    stream: bool = True
    seed: Optional[int] = None
    stop: List[str] = []
    mirostat: int = Field(0, ge=0, le=2)
    mirostat_tau: float = Field(5.0, ge=0.0)
    mirostat_eta: float = Field(0.1, ge=0.0)
    num_thread: int = Field(4, ge=1, le=32)

class MessageSchema(BaseModel):
    role: str
    content: str

class GenerateRequest(BaseModel):
    model: str
    endpoint_type: str
    messages: List[MessageSchema]
    parameters: Parameters
    session_id: Optional[UUID] = None

class Model(BaseModel):
    name: str
    modified_at: datetime
    size: int
    digest: str

class Session(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    updated_at: datetime
    model_name: str
    endpoint_type: str

    class Config:
        from_attributes = True
```

---

## Constants and Configuration

### 8. Default Values

```python
# app/config.py

# Ollama Configuration
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_TIMEOUT = 60.0

# Database Configuration
DATABASE_URL = "sqlite+aiosqlite:///./ollama_web.db"

# Context Configuration
DEFAULT_CONTEXT_SIZE = 10
MAX_CONTEXT_SIZE = 50

# Default Parameters
DEFAULT_PARAMETERS = {
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 40,
    "repeat_penalty": 1.1,
    "num_ctx": 2048,
    "num_predict": 512,
    "stream": True,
    "num_thread": 4
}

# Parameter Presets
PARAMETER_PRESETS = [
    {
        "name": "Creative Writing",
        "description": "High creativity, diverse outputs",
        "parameters": {
            "temperature": 0.9,
            "top_p": 0.95,
            "top_k": 50,
            "repeat_penalty": 1.1
        }
    },
    # ... more presets
]
```

---

**Document Version**: 1.0  
**Last Updated**: December 3, 2025  
**Status**: Design Phase - Not Yet Implemented
