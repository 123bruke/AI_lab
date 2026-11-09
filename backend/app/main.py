from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth_router, experiment_router, ai_agent_router

# Auto-create all SQLite database tables on launch
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MOSEB STUDENT LAB - REST API",
    description="Backend API powering authentication, experiment recording, SQL database storage, and AI Lab Agent for MOSEB Student Lab.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth_router.router, prefix="/api")
app.include_router(experiment_router.router, prefix="/api")
app.include_router(ai_agent_router.router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "MOSEB_STUDENT_LAB_API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "sqlite_connected"}

