"""
MOSEB STUDENT LAB - FastAPI Server Runner
Execute with: python run.pygit add -A ;
 git commit -m "Update code with latest improvements" ; git push origin main

"""
import uvicorn
import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting MOSEB STUDENT LAB API on http://127.0.0.1:{port}")
    print(f"Interactive Swagger Docs available at http://127.0.0.1:{port}/docs")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=False)

