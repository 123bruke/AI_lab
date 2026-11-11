"""
FastAPI Router for 10+ Multi-Agent AI System, YOLOv8 Vision,
ChromaDB Hybrid Search, and Frontend Error Telemetry.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import os
import shutil
import tempfile

try:
    from backend.app.database.connection import get_db
    from backend.app.database.expanded_models import LabReport, AgentTaskLog, ChemicalInventory
    from backend.app.database.expanded_schemas import (
        AgentInfo,
        AgentTaskRequest,
        AgentTaskResponse,
        LabReportCreate,
        LabReportResponse,
        HybridSearchRequest,
        HybridSearchResponse,
        VisionDetectionResponse,
        FrontendErrorPayload,
        ErrorLogResponse
    )
    from backend.app.agents.orchestrator import master_orchestrator
    from backend.app.vector_store.hybrid_search import hybrid_search
    from backend.app.vision.yolo_detector import yolo_lab_detector
    from backend.app.vision.pdf_parser import scientific_pdf_parser
    from backend.app.logging_system.logger import app_logger, log_frontend_error
    from backend.app.logging_system.error_database import record_error_to_db, get_recent_errors
except ImportError:
    from ..database.connection import get_db
    from ..database.expanded_models import LabReport, AgentTaskLog, ChemicalInventory
    from ..database.expanded_schemas import (
        AgentInfo,
        AgentTaskRequest,
        AgentTaskResponse,
        LabReportCreate,
        LabReportResponse,
        HybridSearchRequest,
        HybridSearchResponse,
        VisionDetectionResponse,
        FrontendErrorPayload,
        ErrorLogResponse
    )
    from ..agents.orchestrator import master_orchestrator
    from ..vector_store.hybrid_search import hybrid_search
    from ..vision.yolo_detector import yolo_lab_detector
    from ..vision.pdf_parser import scientific_pdf_parser
    from ..logging_system.logger import app_logger, log_frontend_error
    from ..logging_system.error_database import record_error_to_db, get_recent_errors

router = APIRouter(prefix="/api/agents", tags=["Multi-Agent AI System"])


# ==========================================
# 1. Agents Directory & Task Execution
# ==========================================

@router.get("", response_model=List[AgentInfo])
def get_all_agents():
    """Retrieve metadata, roles, and status for all 10+ registered agents."""
    return master_orchestrator.list_agents()


@router.post("/task", response_model=AgentTaskResponse)
def execute_agent_task(
    payload: AgentTaskRequest,
    db: Session = Depends(get_db)
):
    """
    Dispatch task to a specialized agent or let Master Orchestrator decompose and execute.
    """
    try:
        result = master_orchestrator.route_and_execute(
            prompt=payload.prompt,
            target_agent_id=payload.agent_id,
            parameters=payload.parameters,
            apparatus_state=payload.apparatus_state,
            db_session=db
        )
        return result
    except Exception as e:
        app_logger.error(f"Error executing agent task: {e}", exc_info=True)
        record_error_to_db(
            level="ERROR",
            error_type="AgentTaskExecutionError",
            message=str(e),
            component="MasterOrchestrator",
            stack_trace=str(e)
        )
        raise HTTPException(status_code=500, detail=f"Agent execution failure: {str(e)}")


# ==========================================
# 2. Lab Reports (SQL Database)
# ==========================================

@router.get("/reports", response_model=List[LabReportResponse])
def get_lab_reports(db: Session = Depends(get_db)):
    """Retrieve all formal lab reports saved by the Report Agent."""
    reports = db.query(LabReport).order_by(LabReport.created_at.desc()).all()
    formatted = []
    for r in reports:
        formatted.append({
            "id": r.id,
            "title": r.title,
            "experiment_type": r.experiment_type,
            "author": r.author,
            "abstract": r.abstract,
            "hypothesis": r.hypothesis,
            "methodology": r.methodology,
            "observations": r.observations,
            "calculations": r.calculations,
            "conclusion": r.conclusion,
            "mermaid_diagram": r.mermaid_diagram,
            "apparatus_state": r.apparatus_state,
            "tags": r.tags.split(",") if r.tags else [],
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })
    return formatted


@router.post("/reports", response_model=LabReportResponse)
def create_lab_report(payload: LabReportCreate, db: Session = Depends(get_db)):
    """Directly insert a newly approved lab report into the SQL database."""
    try:
        report = LabReport(
            title=payload.title,
            experiment_type=payload.experiment_type,
            author=payload.author,
            abstract=payload.abstract,
            hypothesis=payload.hypothesis,
            methodology=payload.methodology,
            observations=payload.observations,
            calculations=payload.calculations,
            conclusion=payload.conclusion,
            mermaid_diagram=payload.mermaid_diagram,
            tags=",".join(payload.tags) if payload.tags else ""
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return {
            "id": report.id,
            "title": report.title,
            "experiment_type": report.experiment_type,
            "author": report.author,
            "abstract": report.abstract,
            "hypothesis": report.hypothesis,
            "methodology": report.methodology,
            "observations": report.observations,
            "calculations": report.calculations,
            "conclusion": report.conclusion,
            "mermaid_diagram": report.mermaid_diagram,
            "apparatus_state": {},
            "tags": payload.tags or [],
            "created_at": report.created_at.isoformat()
        }
    except Exception as e:
        db.rollback()
        app_logger.error(f"Failed to create lab report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 3. ChromaDB Hybrid Search
# ==========================================

@router.post("/search", response_model=HybridSearchResponse)
def execute_hybrid_search(payload: HybridSearchRequest):
    """
    Search protocols, MSDS sheets, and lab reports using ChromaDB dense embeddings + BM25 keyword matching.
    """
    try:
        result = hybrid_search.search(
            query=payload.query,
            collection=payload.collection,
            top_k=payload.top_k,
            vector_weight=payload.vector_weight,
            keyword_weight=payload.keyword_weight
        )
        return result
    except Exception as e:
        app_logger.error(f"Hybrid search error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


# ==========================================
# 4. YOLOv8 Apparatus Detection & PDF Parser
# ==========================================

@router.post("/vision/detect", response_model=VisionDetectionResponse)
def detect_apparatus_yolo(
    temperature: float = Query(24.5, description="Current apparatus temp"),
    liquid_level: float = Query(150.0, description="Current meniscus level")
):
    """
    Run YOLOv8 apparatus detection, optical volume calculation, and safety hazard analysis.
    """
    try:
        result = yolo_lab_detector.analyze_image(None, temperature=temperature, liquid_level=liquid_level)
        return result
    except Exception as e:
        app_logger.error(f"Vision detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")


@router.post("/vision/parse-pdf")
async def parse_laboratory_pdf(file: UploadFile = File(...)):
    """
    Upload and parse a laboratory protocol PDF. Extracts sections and indexes into ChromaDB.
    """
    try:
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.filename)
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        raw_text = scientific_pdf_parser.extract_text_from_file(temp_path)
        parsed = scientific_pdf_parser.parse_protocol(raw_text, filename=file.filename)

        # Cleanup
        try:
            os.remove(temp_path)
        except Exception:
            pass

        return parsed
    except Exception as e:
        app_logger.error(f"PDF parsing error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")


# ==========================================
# 5. Frontend Error Logging Telemetry (Separate DB)
# ==========================================

telemetry_router = APIRouter(prefix="/api/telemetry", tags=["Frontend Error Telemetry"])


@telemetry_router.post("/log-error")
def log_frontend_exception(payload: FrontendErrorPayload):
    """
    Receive runtime frontend/UI errors, log with standard Python logging,
    and persist into separate error_logs.db database.
    """
    log_frontend_error(
        component=payload.component or "FrontendUI",
        error_type=payload.error_type,
        message=payload.message,
        stack_trace=payload.stack_trace
    )
    return {"status": "recorded", "message": "Error logged successfully to error_logs.db"}


@telemetry_router.get("/errors", response_model=List[ErrorLogResponse])
def get_recorded_errors(limit: int = 50):
    """Retrieve recorded frontend and backend errors from error_logs.db."""
    return get_recent_errors(limit=limit)

