# AI Dependency Brain Service

Python FastAPI microservice for AI-powered dependency detection and risk analysis.

## Setup

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Add your GROQ_API_KEY and GEMINI_API_KEY

# Run the server
uvicorn main:app --reload --port 8000
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/analyze` | POST | Full project analysis |
| `/api/v1/dependencies/detect` | POST | AI dependency detection |
| `/api/v1/risk/calculate` | POST | Calculate risk score |
| `/api/v1/critical-path` | POST | Get critical path |

## Environment Variables

- `GROQ_API_KEY` - Primary LLM (free tier)
- `GEMINI_API_KEY` - Fallback LLM (free tier)
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_API_URL` - Node.js backend URL for email notifications
