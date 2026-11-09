from pydantic import BaseModel, EmailStr
from typing import Optional, List
import datetime

# --- Auth & User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "student"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Experiment Record Schemas ---
class ExperimentCreate(BaseModel):
    title: Optional[str] = "Thermodynamics Experiment"
    notes: Optional[str] = None
    temperature: float
    volume_ml: float
    solute_name: str
    fire_power: float
    water_state: str

class ExperimentOut(ExperimentCreate):
    id: int
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Lab Notebook Schemas ---
class NotebookCreate(BaseModel):
    title: str
    hypothesis: Optional[str] = None
    observations: Optional[str] = None
    conclusion: Optional[str] = None

class NotebookOut(NotebookCreate):
    id: int
    user_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- AI Agent Consultation Schemas ---
class AgentQuery(BaseModel):
    prompt: str
    current_temp: Optional[float] = 22.0
    current_volume: Optional[float] = 350.0
    current_state: Optional[str] = "liquid"
    solute_name: Optional[str] = "Pure Distilled Water"

class AgentResponse(BaseModel):
    response: str
    recommended_action: Optional[str] = None
    safety_level: str = "SAFE"
    target_temperature: Optional[float] = None
