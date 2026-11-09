# MOSEB STUDENT LAB - Backend API

High-performance Python FastAPI service with SQLite database (SQLAlchemy ORM) and REST API endpoints.

## Features
- **User Authentication**: Secure PBKDF2-SHA256 password hashing & JWT bearer token authentication.
- **SQL Database Storage**: SQLite relational schema (`moseb_lab.db`) tracking user profiles, experiment telemetry, and lab notebook observations.
- **AI Lab Agent**: Intelligent laboratory assistant endpoint `/api/agent/consult` for real-time thermodynamic analysis, safety warnings, and automated action triggers.
- **Interactive Documentation**: Auto-generated Swagger UI at `http://127.0.0.1:8000/docs`.

## Quick Start

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the FastAPI server:
   ```bash
   python run.py
   ```
   or with uvicorn directly:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. Open Swagger API documentation:
   [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

