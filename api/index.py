"""
MOSEB STUDENT LAB - Vercel Serverless Function Entrypoint
Routes all incoming /api/* requests directly into the FastAPI application.
"""
import sys
import os
import types
from pathlib import Path

# Add project root, backend directory, and app directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
app_dir = backend_dir / "app"

for p in [str(root_dir), str(backend_dir), str(app_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

if "backend" not in sys.modules:
    _backend_mod = types.ModuleType("backend")
    _backend_mod.__path__ = [str(backend_dir)]
    _backend_mod.__package__ = "backend"
    sys.modules["backend"] = _backend_mod
    try:
        import app as _app_mod
        _backend_mod.app = _app_mod
        sys.modules["backend.app"] = _app_mod
    except Exception:
        pass

# Set working directory to backend root so SQLite and static assets resolve correctly
os.environ.setdefault("MOSEB_ENV", "production")

try:
    from backend.app.main import app as fastapi_app
except ImportError:
    from app.main import app as fastapi_app

# Vercel ASGI serverless handler
app = fastapi_app
