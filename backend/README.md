# Ollama Web Interface - Backend

FastAPI backend for the Ollama Web Interface.

## Setup

1. Install Python 3.9+

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Make sure Ollama is running on localhost:11434

5. Run the server:
```bash
cd backend
python -m app.main
```

Or use uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Create a `.env` file in the backend directory:

```
OLLAMA_BASE_URL=http://localhost:11434
DEBUG=True
```

## Project Structure

```
backend/
├── app/
│   ├── api/          # API route handlers
│   ├── models/       # Database and Pydantic models
│   ├── services/     # Business logic
│   ├── config.py     # Configuration
│   ├── database.py   # Database setup
│   └── main.py       # FastAPI app
└── requirements.txt  # Python dependencies
```
