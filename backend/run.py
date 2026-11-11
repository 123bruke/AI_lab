"""
MOSEB STUDENT LAB - FastAPI Server Runner
Execute with: python run.py
"""
import uvicorn
import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent

for p in [str(root_dir), str(backend_dir), str(backend_dir / "app")]:
    if p not in sys.path:
        sys.path.insert(0, p)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting MOSEB STUDENT LAB API on http://127.0.0.1:{port}")
    print(f"Interactive Swagger Docs available at http://127.0.0.1:{port}/docs")
    try:
        uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)
    except Exception:
        uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
