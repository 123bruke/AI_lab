# MOSEB STUDENT LAB - Backend API

High-performance Python FastAPI service with 10+ Autonomous AI Agents, ChromaDB Hybrid Search, YOLOv8 Optics, SQLite database (SQLAlchemy ORM), and Frontend Error Telemetry.

---

## 🚀 Deployment Options

### 1. Vercel Serverless Function Deployment
The backend includes a dedicated [`vercel.json`](vercel.json) using `@vercel/python`:
- In your Vercel Dashboard:
  - **Root Directory**: `backend`
  - **Framework Preset**: Other
- Automatically routes `/(.*)` to `app/main.py` via ASGI serverless handlers.

### 2. Render / Railway / Heroku Deployment
A [`Procfile`](Procfile) and [`runtime.txt`](runtime.txt) are included:
```bash
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
- Set `PYTHONPATH=.` in your environment variables.

### 3. Docker & Container Deployment
Build and run using the production-ready [`Dockerfile`](Dockerfile):
```bash
cd backend
docker build -t moseb-lab-backend .
docker run -p 8000:8000 moseb-lab-backend
```
Or with [`docker-compose.yml`](docker-compose.yml):
```bash
cd backend
docker compose up -d
```

---

## 🛠️ Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the FastAPI server:
   ```bash
   python run.py
   ```
   Or directly with Uvicorn:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. Open Interactive Swagger UI:
   [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
