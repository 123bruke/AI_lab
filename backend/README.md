# MOSEB STUDENT LAB - Backend API

High-performance Python FastAPI service with 10+ Autonomous AI Agents, ChromaDB Hybrid Search, YOLOv8 Optics, SQLite database (SQLAlchemy ORM), and Frontend Error Telemetry.

---

## 🏗️ Architecture

- **FastAPI Core**: 12 REST endpoints including auth, experiments, multi-agent dispatch, RAG assistant, and telemetry.
- **Multi-Agent Orchestrator**: 10 specialized laboratory agents (Diagram, Report, Chemical, Research, Simulation, Safety, Spectroscopy, Stoichiometry, Vision, QA).
- **Hybrid Search**: Dense semantic vector similarity combined with BM25 keyword matching via Reciprocal Rank Fusion (RRF).
- **Optical Apparatus Analyzer**: YOLOv8 laboratory vision pipeline with standalone offline fallbacks.
- **Relational SQL Database**: SQLite via SQLAlchemy with 7 normalized tables.
- **Error Telemetry**: Self-healing error logging persisted to dedicated `error_logs.db`.

---

## 🛠️ Quick Start & Local Execution

1. Install Python dependencies:
   ```bash
   cd backend
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

3. Open the Interactive Swagger UI:
   [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🌐 Production Server & Cloud Hosting

To run in production environments (Render, Railway, DigitalOcean, AWS, VPS):
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
