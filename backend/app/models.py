"""
Unified SQLAlchemy Models forwarding to expanded_models.
"""

try:
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
    from app.database.expanded_models import (
        User,
        ExperimentRecord,
        LabNotebook,
        AgentTaskLog,
        LabReport,
        ChemicalInventory,
        DocumentRecord
    )

__all__ = [
    "User",
    "ExperimentRecord",
    "LabNotebook",
    "AgentTaskLog",
    "LabReport",
    "ChemicalInventory",
    "DocumentRecord"
]
