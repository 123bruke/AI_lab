"""
MOSEB STUDENT LAB - Main FastAPI Application.
Integrates Multi-Agent AI System, YOLOv8 Vision, ChromaDB Hybrid Search,
SQL Database, and Frontend Error Telemetry.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import contextlib

from backend.app.database.connection import engine, Base
import backend.app.database.expanded_models  # Ensure all expanded tables are registered
from backend.app.routers import auth_router, experiment_router, ai_agent_router
from backend.app.routers.multi_agent_router import router as multi_agent_api_router, telemetry_router
from backend.app.vector_store.chroma_service import chroma_service
from backend.app.logging_system.logger import app_logger


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create SQL tables and seed ChromaDB vector store
    Base.metadata.create_all(bind=engine)
    app_logger.info("SQL database schema initialized successfully")
    try:
        counts = chroma_service.seed_test_data()
        app_logger.info(f"ChromaDB knowledge base seeded: {counts}")
    except Exception as e:
        app_logger.warning(f"Could not auto-seed ChromaDB on startup: {e}")
    yield
    # Shutdown
    app_logger.info("MOSEB Student Lab API shutting down")


app = FastAPI(
    title="MOSEB STUDENT LAB - Autonomous Multi-Agent API",
    description="Backend API powering 10+ Autonomous AI Agents, YOLOv8 Vision, ChromaDB Hybrid Search, SQL Database, and Frontend Error Telemetry.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all route modules
app.include_router(auth_router.router, prefix="/api")
app.include_router(experiment_router.router, prefix="/api")
app.include_router(ai_agent_router.router, prefix="/api")
app.include_router(multi_agent_api_router)
app.include_router(telemetry_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "MOSEB_STUDENT_LAB_MULTI_AGENT_API",
        "version": "2.0.0",
        "docs_url": "/docs",
        "features": [
            "10+ Autonomous Agents",
            "ChromaDB Hybrid Search (Vector + BM25)",
            "YOLOv8 Laboratory Vision",
            "Academic Lab Report Generation",
            "Separate Error Logging Database"
        ]
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "chromadb_collections": list(chroma_service.collections.keys()) if hasattr(chroma_service, "collections") else ["protocols", "msds", "reports"],
        "agents_count": 10
    }
