"""
MOSEB STUDENT LAB - Main Application Entrypoint for Vercel and Local Running
"""
import sys
import os
import types
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
app_dir = backend_dir / "app"

for p in [str(backend_dir), str(app_dir)]:
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

os.environ.setdefault("MOSEB_ENV", "production")

try:
    from app.main import app
except ImportError:
    from backend.app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"Starting MOSEB STUDENT LAB API on http://127.0.0.1:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
