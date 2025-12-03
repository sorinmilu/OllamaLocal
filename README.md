# Ollama Web Interface

A modern web interface for interacting with your local Ollama instance.

## Features

- ✅ **Model Management**: List, download, and delete models
- ✅ **Multiple Sessions**: Manage concurrent conversations
- ✅ **Parameter Configuration**: Full control over generation parameters
- ✅ **Context Management**: Automatic context window handling
- ✅ **Streaming Responses**: Real-time text generation
- ✅ **PDF Export**: Export conversations to PDF
- ✅ **Light/Dark Theme**: Toggle between themes
- ✅ **Responsive Design**: Bootstrap-based UI

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + React Bootstrap
- **Backend**: Python FastAPI
- **Database**: SQLite
- **Ollama**: Local instance integration

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- Ollama installed and running on `localhost:11434`

## Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
python -m app.main
```

Backend will start on `http://localhost:8000`

API Documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will start on `http://localhost:5173`

### 3. Make sure Ollama is running

```bash
ollama serve
```

## Usage

1. Open http://localhost:5173 in your browser
2. Select or download a model
3. Create a new conversation session
4. Configure parameters as needed
5. Start chatting!

## Project Structure

```
TestCopilot/
├── backend/
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   ├── models/           # Database & Pydantic models
│   │   ├── services/         # Business logic
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database setup
│   │   └── main.py           # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript types
│   │   ├── App.tsx           # Main component
│   │   └── main.tsx          # Entry point
│   └── package.json
└── docs/
    ├── API.md                # API reference
    ├── Architecture.md       # System architecture
    ├── CoreReference.md      # Developer reference
    └── UserGuide.md          # User documentation
```

## Development

### Backend Development

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Build for Production

Frontend:
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

## Documentation

See the `docs/` directory for detailed documentation:

- **API.md**: Complete REST API reference
- **Architecture.md**: System design and architecture
- **CoreReference.md**: Core functions and modules
- **UserGuide.md**: End-user guide

## Troubleshooting

### Backend won't start
- Ensure Python 3.9+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify Ollama is running: `curl http://localhost:11434`

### Frontend won't start
- Ensure Node.js 18+ is installed
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check that backend is running on port 8000

### Cannot connect to Ollama
- Start Ollama: `ollama serve`
- Verify it's accessible: `curl http://localhost:11434/api/tags`
- Check firewall settings

## License

MIT

## Author

Built as an architecture design and implementation exercise.
