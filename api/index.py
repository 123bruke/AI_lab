"""
MOSEB STUDENT LAB - Vercel Serverless Function Entrypoint
Routes all incoming /api/* requests directly into the FastAPI application.
"""
import sys
import os
from pathlib import Path

# Add project root and backend directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

for p in [str(root_dir), str(backend_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Set working directory to backend root so SQLite and static assets resolve correctly
os.environ.setdefault("MOSEB_ENV", "production")

try:
    from backend.app.main import app as fastapi_app
except ImportError:
    from app.main import app as fastapi_app

# Vercel ASGI serverless handler
app = fastapi_app
