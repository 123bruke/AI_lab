import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

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

