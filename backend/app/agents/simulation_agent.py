"""
Agent 5: Thermodynamic Simulation & Apparatus Control Agent.
Takes direct physical actions in the laboratory simulation (igniting burner,
adjusting flame intensity, ice cooling, water refill, magnetic stirring).
"""

from typing import Dict, Any, Optional
import re
try:
    from backend.app.agents.base_agent import BaseAgent
    from backend.app.database.expanded_models import AgentTaskLog
    from backend.app.logging_system.logger import app_logger
except ImportError:
    from .base_agent import BaseAgent
    from ..database.expanded_models import AgentTaskLog
    from ..logging_system.logger import app_logger


class SimulationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="simulation_agent",
            name="Thermodynamic Action Agent",
            role="Hardware & Simulation Apparatus Controller",
            category="Simulation Control",
            description="Executes physical commands in the 3D lab environment, including Bunsen burner ignition, ice cooling, water volume adjustment, and stirrer RPM regulation.",
            supported_tasks=["ignite_burner", "extinguish_flame", "apply_ice_cooling", "refill_water", "adjust_stir_rpm", "emergency_stop"],
            icon="Zap"
        )

    def execute(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        apparatus_state: Optional[Dict[str, Any]] = None,
        db_session: Optional[Any] = None
    ) -> Dict[str, Any]:
        text = prompt.lower()
        current_state = dict(apparatus_state or {
            "temperature": 24.5,
            "waterLevel": 150.0,
            "isBurnerOn": False,
            "stirRpm": 0.0
        })

        mutations = {}
        action_name = "standby"
        action_desc = "No physical apparatus state changes triggered."

        # Parse actions
        if any(w in text for w in ["heat", "ignite", "turn on burner", "fire", "burn", "boil"]):
            # Check target temperature if provided
            temp_match = re.search(r"(\d+)\s*(?:c|degrees|deg|celsius)", text)
            target_t = float(temp_match.group(1)) if temp_match else 85.0
            mutations["isBurnerOn"] = True
            mutations["temperature"] = min(100.0, max(current_state.get("temperature", 24.5) + 15.0, target_t))
            action_name = "ignite_burner"
            action_desc = f"Burner ignited. Regulating thermal output towards {target_t:.1f}°C."

        elif any(w in text for w in ["cool", "ice", "chill", "freeze", "extinguish", "turn off burner", "stop heating"]):
            mutations["isBurnerOn"] = False
            mutations["temperature"] = max(4.0, current_state.get("temperature", 24.5) - 20.0)
            action_name = "apply_cooling"
            action_desc = f"Extinguished burner flame and applied ice bath quenching. Temperature lowered to {mutations['temperature']:.1f}°C."

        elif any(w in text for w in ["refill", "add water", "pour", "fill"]):
            vol_match = re.search(r"(\d+)\s*(?:ml|milliliters)", text)
            add_ml = float(vol_match.group(1)) if vol_match else 50.0
            new_vol = min(250.0, current_state.get("waterLevel", 150.0) + add_ml)
            mutations["waterLevel"] = new_vol
            action_name = "refill_water"
            action_desc = f"Added {add_ml:.1f} mL deionized water. Meniscus level raised to {new_vol:.1f} mL."

        elif any(w in text for w in ["stir", "agitate", "spin", "magnetic"]):
            rpm_match = re.search(r"(\d+)\s*(?:rpm)?", text)
            rpm = float(rpm_match.group(1)) if rpm_match else 450.0
            mutations["stirRpm"] = rpm
            action_name = "adjust_stir_rpm"
            action_desc = f"Activated magnetic stir plate at {rpm:.0f} RPM for homogeneous solute dispersion."

        elif any(w in text for w in ["emergency", "abort", "cut off", "shutdown", "halt"]):
            mutations["isBurnerOn"] = False
            mutations["stirRpm"] = 0.0
            action_name = "emergency_shutdown"
            action_desc = "Emergency isolation initiated: Burner gas closed, stir motor halted."

        # Merge mutations into new apparatus state
        updated_state = {**current_state, **mutations}

        # Log task in database
        if db_session:
            try:
                log_entry = AgentTaskLog(
                    agent_name=self.name,
                    task_type=action_name,
                    prompt=prompt,
                    status="SUCCESS",
                    result_summary=action_desc
                )
                db_session.add(log_entry)
                db_session.commit()
            except Exception as e:
                db_session.rollback()
                app_logger.warning(f"Could not log simulation action to DB: {e}")

        summary = f"Apparatus Action Taken: {action_desc}"

        return {
            "summary": summary,
            "details": f"Simulation Agent executed physical apparatus command '{action_name}'. Mutated properties: {list(mutations.keys())}.",
            "structured_data": {
                "action": action_name,
                "mutations": mutations,
                "previous_state": current_state,
                "updated_state": updated_state
            },
            "diagram_mermaid": None,
            "svg_render": None,
            "actions_taken": [
                {"action": action_name, "state_mutations": mutations}
            ]
        }

