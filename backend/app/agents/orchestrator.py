"""
Master Multi-Agent Orchestrator for MOSEB Student Lab.
Manages a team of 10+ autonomous specialized agents, parses complex natural
language instructions, coordinates multi-step workflows, and executes physical actions.
"""

from typing import Dict, Any, List, Optional
import uuid
import time
from datetime import datetime

from backend.app.agents.base_agent import BaseAgent
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

from backend.app.logging_system.logger import app_logger


class MasterAgentOrchestrator:
    """
    Central Coordinator for the 10+ Autonomous Laboratory Agents.
    Routes user prompts to specialized agents and synthesizes unified multi-agent outcomes.
    """

    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self._register_default_agents()

    def _register_default_agents(self):
        registered = [
            DiagramAgent(),
            ReportAgent(),
            ChemicalAgent(),
            ResearchAgent(),
            SimulationAgent(),
            SafetyAgent(),
            SpectroscopyAgent(),
            StoichiometryAgent(),
            VisionAgent(),
            QualityAssuranceAgent()
        ]
        for agent in registered:
            self.agents[agent.agent_id] = agent
        app_logger.info(f"Master Agent Orchestrator initialized with {len(self.agents)} specialized agents")

    def list_agents(self) -> List[Dict[str, Any]]:
        """Return metadata for all registered agents."""
        return [agent.get_info() for agent in self.agents.values()]

    def route_and_execute(
        self,
        prompt: str,
        target_agent_id: Optional[str] = None,
        parameters: Optional[Dict[str, Any]] = None,
        apparatus_state: Optional[Dict[str, Any]] = None,
        db_session: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates multi-agent execution. If target_agent_id is provided,
        dispatches to that agent; otherwise, performs autonomous intent classification
        and executes an orchestrated chain.
        """
        task_id = f"task_{uuid.uuid4().hex[:10]}"
        start_time = time.time()
        p_lower = prompt.lower()

        # 1. Direct dispatch if target agent specified
        if target_agent_id and target_agent_id in self.agents:
            agent = self.agents[target_agent_id]
            app_logger.info(f"Direct dispatch to agent '{agent.name}' ({target_agent_id}) for task {task_id}")
            result = agent.execute(prompt, parameters, apparatus_state, db_session)
            return {
                "task_id": task_id,
                "agent_id": agent.agent_id,
                "agent_name": agent.name,
                "status": "COMPLETED",
                "summary": result.get("summary", ""),
                "details": result.get("details", ""),
                "structured_data": result.get("structured_data"),
                "diagram_mermaid": result.get("diagram_mermaid"),
                "svg_render": result.get("svg_render"),
                "actions_taken": result.get("actions_taken", []),
                "created_at": datetime.utcnow().isoformat()
            }

        # 2. Autonomous Multi-Agent Intent Decomposition
        app_logger.info(f"Autonomous orchestration initiated for prompt: '{prompt}'")
        selected_agent_ids = []

        # Check Simulation action intent
        if any(w in p_lower for w in ["heat", "burn", "cool", "ice", "refill", "water", "stir", "stop", "ignite"]):
            selected_agent_ids.append("simulation_agent")

        # Check Chemical identification intent
        if any(w in p_lower for w in ["chemical", "formula", "reagent", "molar", "compound", "hcl", "naoh", "cuso4", "nacl", "acid", "base"]):
            selected_agent_ids.append("chemical_agent")

        # Check Report intent
        if any(w in p_lower for w in ["report", "paper", "manuscript", "document", "abstract", "conclusion"]):
            selected_agent_ids.append("report_agent")

        # Check Diagram intent
        if any(w in p_lower for w in ["diagram", "draw", "mermaid", "flowchart", "curve", "graph", "plot"]):
            selected_agent_ids.append("diagram_agent")

        # Check Research / Search intent
        if any(w in p_lower for w in ["search", "find", "protocol", "literature", "paper", "chroma", "hybrid"]):
            selected_agent_ids.append("research_agent")

        # Check Safety intent
        if any(w in p_lower for w in ["safe", "hazard", "ppe", "warning", "risk", "audit"]):
            selected_agent_ids.append("safety_agent")

        # Check Spectroscopy intent
        if any(w in p_lower for w in ["absorbance", "spectro", "beer", "transmittance", "wavelength", "optics"]):
            selected_agent_ids.append("spectroscopy_agent")

        # Check Stoichiometry intent
        if any(w in p_lower for w in ["stoichiometry", "balance", "yield", "limiting", "reaction"]):
            selected_agent_ids.append("stoichiometry_agent")

        # Check Vision / PDF intent
        if any(w in p_lower for w in ["vision", "camera", "detect", "yolo", "pdf", "image", "meniscus"]):
            selected_agent_ids.append("vision_agent")

        # Check QA / Verification intent
        if any(w in p_lower for w in ["verify", "error", "grade", "precision", "quality"]):
            selected_agent_ids.append("qa_agent")

        # Default fallback if no keyword matches
        if not selected_agent_ids:
            selected_agent_ids = ["simulation_agent", "diagram_agent", "report_agent"]

        # Execute orchestrated sequence
        executed_results = []
        all_actions = []
        last_diagram = None
        last_svg = None
        primary_summary = []
        current_state = dict(apparatus_state or {})

        for agent_id in selected_agent_ids:
            agent = self.agents[agent_id]
            res = agent.execute(prompt, parameters, current_state, db_session)
            executed_results.append({
                "agent_id": agent_id,
                "agent_name": agent.name,
                "result": res
            })
            if res.get("summary"):
                primary_summary.append(f"[{agent.name}]: {res['summary']}")
            if res.get("actions_taken"):
                all_actions.extend(res["actions_taken"])
            if res.get("diagram_mermaid"):
                last_diagram = res["diagram_mermaid"]
            if res.get("svg_render"):
                last_svg = res["svg_render"]
            # If simulation mutated state, propagate to next agent
            if "structured_data" in res and res["structured_data"] and "updated_state" in res["structured_data"]:
                current_state = res["structured_data"]["updated_state"]

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        synthesized_summary = " | ".join(primary_summary) if primary_summary else f"Orchestrated {len(selected_agent_ids)} agents successfully."

        return {
            "task_id": task_id,
            "agent_id": "orchestrator",
            "agent_name": "Master Multi-Agent Orchestrator",
            "status": "COMPLETED",
            "summary": synthesized_summary,
            "details": f"Orchestrator coordinated {len(selected_agent_ids)} specialized agents: {', '.join([self.agents[a].name for a in selected_agent_ids])} in {elapsed_ms}ms.",
            "structured_data": {
                "active_agents": selected_agent_ids,
                "step_count": len(executed_results),
                "execution_trace": executed_results,
                "final_apparatus_state": current_state
            },
            "diagram_mermaid": last_diagram,
            "svg_render": last_svg,
            "actions_taken": all_actions,
            "created_at": datetime.utcnow().isoformat()
        }


# Global Orchestrator Instance
master_orchestrator = MasterAgentOrchestrator()
