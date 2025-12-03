# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Make Sure Ollama is Running

```bash
ollama serve
```

Verify: http://localhost:11434/api/tags should return a list of models.

### 3. Start the Application

**Option A: Use the startup script (Windows)**
```bash
start.bat
```

**Option B: Manual start**

Terminal 1 (Backend):
```bash
cd backend
venv\Scripts\activate
python -m app.main
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎯 First Steps

1. **Download a Model** (if you don't have any):
   ```bash
   ollama pull llama2
   ```

2. **Open the Web Interface**: http://localhost:5173

3. **Create a Session**: Click "New Session" and select a model

4. **Start Chatting**: Type your message and press Enter

## 📖 Next Steps

- Read the [User Guide](docs/UserGuide.md) for detailed features
- Check [API Documentation](docs/API.md) for backend endpoints
- Review [Architecture](docs/Architecture.md) for system design

## 🐛 Troubleshooting

**"Cannot connect to Ollama"**
- Make sure Ollama is running: `ollama serve`
- Check: http://localhost:11434

**Backend errors**
- Activate venv: `venv\Scripts\activate`
- Install deps: `pip install -r requirements.txt`

**Frontend errors**
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`

## 📝 Features Implemented

✅ Backend API (FastAPI)
✅ Database (SQLite)  
✅ Model Management
✅ Session Management
✅ Parameter Configuration
✅ Context Handling
✅ PDF Export
✅ Streaming Responses
🔄 Frontend UI (Basic structure)

## 🔧 Development Mode

Backend with auto-reload:
```bash
uvicorn app.main:app --reload
```

Frontend with HMR:
```bash
npm run dev
```

Enjoy! 🎉
