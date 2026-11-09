"""
Expanded Pydantic Schemas for Multi-Agent AI System, ChromaDB Hybrid Search,
Lab Reports, Chemical Inventory, Vision Analysis, and Frontend Error Telemetry.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ==========================================
# 1. Agent Task & Orchestrator Schemas
# ==========================================

class AgentInfo(BaseModel):
    id: str
    name: str
    role: str
    category: str
    description: str
    status: str = "idle"  # idle, processing, completed, error
    supported_tasks: List[str]
    icon: str


class AgentTaskRequest(BaseModel):
    agent_id: Optional[str] = None  # None for auto-orchestration
    task_type: str = "general"
    prompt: str
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    apparatus_state: Optional[Dict[str, Any]] = None


class AgentTaskResponse(BaseModel):
    task_id: str
    agent_id: str
    agent_name: str
    status: str
    summary: str
    details: str
    structured_data: Optional[Dict[str, Any]] = None
    diagram_mermaid: Optional[str] = None
    svg_render: Optional[str] = None
    actions_taken: Optional[List[Dict[str, Any]]] = None
    created_at: str


class OrchestratorPlan(BaseModel):
    user_goal: str
    selected_agents: List[str]
    execution_steps: List[Dict[str, Any]]
    final_synthesis: Optional[str] = None


# ==========================================
# 2. Lab Report Generation Schemas
# ==========================================

class LabReportCreate(BaseModel):
    title: str
    experiment_type: str
    author: str = "AI Autonomous Researcher"
    abstract: str
    hypothesis: Optional[str] = None
    methodology: str
    observations: str
    calculations: Optional[str] = None
    conclusion: str
    mermaid_diagram: Optional[str] = None
    apparatus_state: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = Field(default_factory=list)


class LabReportResponse(BaseModel):
    id: int
    title: str
    experiment_type: str
    author: str
    abstract: str
    hypothesis: Optional[str]
    methodology: str
    observations: str
    calculations: Optional[str]
    conclusion: str
    mermaid_diagram: Optional[str]
    apparatus_state: Optional[Dict[str, Any]]
    tags: Optional[List[str]]
    created_at: str


# ==========================================
# 3. Chemical Inventory & Identification
# ==========================================

class ChemicalIdentifyRequest(BaseModel):
    query: str  # chemical name, formula, or CAS number
    include_safety_hazards: bool = True
    include_spectroscopy: bool = False


class ChemicalRecordSchema(BaseModel):
    id: Optional[int] = None
    formula: str
    name: str
    common_name: Optional[str] = None
    cas_number: Optional[str] = None
    molar_mass: Optional[float] = None
    density: Optional[float] = None
    boiling_point: Optional[float] = None
    melting_point: Optional[float] = None
    physical_state: str = "liquid"
    hazard_codes: List[str] = Field(default_factory=list)
    storage_class: str = "General"
    compatibility_group: Optional[str] = None
    handling_instructions: Optional[str] = None


# ==========================================
# 4. Vision & YOLO Apparatus Detection
# ==========================================

class DetectedObject(BaseModel):
    label: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]
    attributes: Optional[Dict[str, Any]] = None


class VisionDetectionResponse(BaseModel):
    timestamp: str
    model_version: str = "YOLOv8-LabApparatus-Optics"
    detections: List[DetectedObject]
    summary: str
    identified_apparatus: List[str]
    estimated_liquid_volume_ml: Optional[float] = None
    thermal_hotspots_detected: bool = False
    safety_violations: List[str] = Field(default_factory=list)


# ==========================================
# 5. ChromaDB & Hybrid Search Schemas
# ==========================================

class HybridSearchRequest(BaseModel):
    query: str
    collection: Optional[str] = "all"  # protocols, msds, reports, all
    top_k: int = 5
    vector_weight: float = 0.65  # Weight for dense vector similarity
    keyword_weight: float = 0.35  # Weight for BM25 lexical matching


class HybridSearchMatch(BaseModel):
    id: str
    title: str
    collection: str
    snippet: str
    combined_score: float
    vector_score: float
    keyword_score: float
    metadata: Dict[str, Any]


class HybridSearchResponse(BaseModel):
    query: str
    total_matches: int
    execution_time_ms: float
    results: List[HybridSearchMatch]


# ==========================================
# 6. Frontend Error Telemetry Schemas
# ==========================================

class FrontendErrorPayload(BaseModel):
    error_type: str = "RuntimeError"
    message: str
    component: Optional[str] = "UI"
    stack_trace: Optional[str] = None
    url: Optional[str] = None
    user_agent: Optional[str] = None
    severity: str = "ERROR"  # INFO, WARNING, ERROR, CRITICAL


class ErrorLogResponse(BaseModel):
    id: int
    timestamp: str
    level: str
    error_type: str
    message: str
    component: Optional[str]
    stack_trace: Optional[str]
    resolved: bool

