try:
    from backend.app.database.connection import engine, SessionLocal, Base, get_db
    from backend.app.database.expanded_models import (
        User,
        ExperimentRecord,
        LabNotebook,
        AgentTaskLog,
        LabReport,
        ChemicalInventory,
        DocumentRecord
    )
except ImportError:
    from .connection import engine, SessionLocal, Base, get_db
    from .expanded_models import (
        User,
        ExperimentRecord,
        LabNotebook,
        AgentTaskLog,
        LabReport,
        ChemicalInventory,
        DocumentRecord
    )

__all__ = [
    "engine",
    "SessionLocal",
    "Base",
    "get_db",
    "User",
    "ExperimentRecord",
    "LabNotebook",
    "AgentTaskLog",
    "LabReport",
    "ChemicalInventory",
    "DocumentRecord"
]
