import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default="student") # student, researcher, instructor
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    experiments = relationship("ExperimentRecord", back_populates="user", cascade="all, delete-orphan")
    notebook_entries = relationship("LabNotebook", back_populates="user", cascade="all, delete-orphan")
    agent_tasks = relationship("AgentTaskLog", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("LabReport", back_populates="user", cascade="all, delete-orphan")

class ExperimentRecord(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(120), default="Thermodynamics Experiment")
    notes = Column(Text, nullable=True)
    temperature = Column(Float, default=22.0)
    volume_ml = Column(Float, default=350.0)
    solute_name = Column(String(60), default="Pure Distilled Water")
    fire_power = Column(Float, default=0.5)
    water_state = Column(String(30), default="liquid")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="experiments")

class LabNotebook(Base):
    __tablename__ = "lab_notebooks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    hypothesis = Column(Text, nullable=True)
    observations = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notebook_entries")

class AgentTaskLog(Base):
    __tablename__ = "agent_task_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    agent_name = Column(String(80), index=True, nullable=False)
    action_type = Column(String(80), nullable=False)
    input_query = Column(Text, nullable=False)
    output_result = Column(Text, nullable=False)
    action_payload = Column(Text, nullable=True) # JSON of lab actions taken
    status = Column(String(20), default="SUCCESS") # SUCCESS, FAILED, WARNING
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="agent_tasks")

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False)
    experiment_type = Column(String(100), default="Phase Transition")
    abstract = Column(Text, nullable=True)
    methodology = Column(Text, nullable=True)
    data_tables_json = Column(Text, nullable=True)
    diagram_mermaid = Column(Text, nullable=True)
    discussion = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")

class ChemicalInventory(Base):
    __tablename__ = "chemical_inventory"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    formula = Column(String(60), nullable=False)
    cas_number = Column(String(30), nullable=True)
    molar_mass = Column(Float, nullable=False) # g/mol
    density = Column(Float, default=1.0) # g/cm3
    boiling_point = Column(Float, nullable=True) # °C
    melting_point = Column(Float, nullable=True) # °C
    enthalpy_vap = Column(Float, nullable=True) # kJ/mol
    enthalpy_fusion = Column(Float, nullable=True) # kJ/mol
    color_hex = Column(String(10), default="#38bdf8")
    hazard_class = Column(String(80), default="NON-HAZARDOUS")
    description = Column(Text, nullable=True)

class DocumentRecord(Base):
    __tablename__ = "indexed_documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False) # pdf, image, json
    chroma_id = Column(String(100), unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=True)
    extracted_text = Column(Text, nullable=True)
    yolo_detections_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

