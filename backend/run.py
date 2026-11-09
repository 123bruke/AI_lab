"""
MOSEB STUDENT LAB - FastAPI Server Runner
Execute with: python run.py
git add -A ; git commit -m "Update code with latest improvements" ; git push origin main
"""
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting MOSEB STUDENT LAB API on http://127.0.0.1:{port}")
    print(f"Interactive Swagger Docs available at http://127.0.0.1:{port}/docs")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

