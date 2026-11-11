try:
    from backend.app.agents.base_agent import BaseAgent
    from backend.app.agents.orchestrator import master_orchestrator, MasterAgentOrchestrator
    from backend.app.agents.diagram_agent import DiagramAgent
    from backend.app.agents.report_agent import ReportAgent
    from backend.app.agents.chemical_agent import ChemicalAgent
    from backend.app.agents.research_agent import ResearchAgent
    from backend.app.agents.simulation_agent import SimulationAgent
    from backend.app.agents.safety_agent import SafetyAgent
    from backend.app.agents.spectroscopy_agent import SpectroscopyAgent
    from backend.app.agents.stoichiometry_agent import StoichiometryAgent
    from backend.app.agents.vision_agent import VisionAgent
    from backend.app.agents.qa_agent import QualityAssuranceAgent
except ImportError:
    from .base_agent import BaseAgent
    from .orchestrator import master_orchestrator, MasterAgentOrchestrator
    from .diagram_agent import DiagramAgent
    from .report_agent import ReportAgent
    from .chemical_agent import ChemicalAgent
    from .research_agent import ResearchAgent
    from .simulation_agent import SimulationAgent
    from .safety_agent import SafetyAgent
    from .spectroscopy_agent import SpectroscopyAgent
    from .stoichiometry_agent import StoichiometryAgent
    from .vision_agent import VisionAgent
    from .qa_agent import QualityAssuranceAgent

__all__ = [
    "BaseAgent",
    "master_orchestrator",
    "MasterAgentOrchestrator",
    "DiagramAgent",
    "ReportAgent",
    "ChemicalAgent",
    "ResearchAgent",
    "SimulationAgent",
    "SafetyAgent",
    "SpectroscopyAgent",
    "StoichiometryAgent",
    "VisionAgent",
    "QualityAssuranceAgent"
]

