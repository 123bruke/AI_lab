"""
MOSEB STUDENT LAB - Vercel Serverless Function Entrypoint
Routes all incoming requests directly into the FastAPI application.
"""
import sys
import os
import types
from pathlib import Path

# Add backend directory and app directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
app_dir = backend_dir / "app"

for p in [str(backend_dir), str(app_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Provide synthetic backend module if needed
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

# Set production environment flag for serverless runtime
os.environ.setdefault("MOSEB_ENV", "production")

try:
    from app.main import app
except ImportError:
    from backend.app.main import app
