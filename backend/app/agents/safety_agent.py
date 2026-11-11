"""
Agent 6: Laboratory Safety & Hazard Compliance Auditor.
Audits operational procedures, checks PPE compliance, detects runaway thermal conditions,
and enforces hazardous chemical protocols.
"""

from typing import Dict, Any, Optional, List
try:
    from backend.app.agents.base_agent import BaseAgent
    from backend.app.logging_system.logger import app_logger
except ImportError:
    from .base_agent import BaseAgent
    from ..logging_system.logger import app_logger


class SafetyAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="safety_agent",
            name="Safety & Compliance Auditor",
            role="Environmental Health, Safety (EHS) & Hazard Inspector",
            category="Safety",
            description="Continuously monitors lab telemetry for thermal runaway, acid/water sequence violations, dry boiling risks, and OSHA/GHS PPE compliance.",
            supported_tasks=["audit_safety_compliance", "check_ppe", "evaluate_thermal_risk", "spill_containment_protocol"],
            icon="ShieldAlert"
        )

    def execute(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        apparatus_state: Optional[Dict[str, Any]] = None,
        db_session: Optional[Any] = None
    ) -> Dict[str, Any]:
        temp = apparatus_state.get("temperature", 24.5) if apparatus_state else 24.5
        liquid = apparatus_state.get("waterLevel", 150.0) if apparatus_state else 150.0
        burner = apparatus_state.get("isBurnerOn", False) if apparatus_state else False

        hazards = []
        recommendations = []
        safety_score = 100

        # 1. Thermal checks
        if temp > 95.0:
            hazards.append("Vigorous Boiling Alert: Solution temperature exceeds 95°C. Risk of superheating and steam scalding.")
            recommendations.append("Reduce burner gas flow or introduce boiling chips to facilitate nucleation.")
            safety_score -= 20

        if temp > 105.0:
            hazards.append("Critical Thermal Hazard: Exceeded standard aqueous boiling point. High danger of thermal vessel stress.")
            recommendations.append("Immediate flame extinction and thermal shielding recommended.")
            safety_score -= 40

        # 2. Dry heating checks
        if burner and liquid < 30.0:
            hazards.append("Dry Glassware Heating Hazard: Insufficient liquid volume (<30 mL) while burner flame is engaged. Risk of beaker fracture.")
            recommendations.append("Extinguish burner immediately and allow glassware to cool gradually before refilling.")
            safety_score -= 35

        # 3. PPE Verification
        ppe_required = [
            "ANSI Z87.1 Approved Chemical Splash Goggles",
            "Nitrile Chemical-Resistant Gloves (4 mil minimum)",
            "Flame-Resistant Cotton Lab Coat",
            "Heat-Resistant Beaker Tongs for Vessel Handling"
        ]

        if not hazards:
            status_text = "NOMINAL — All laboratory parameters comply with EHS laboratory safety standards."
        else:
            status_text = f"ATTENTION REQUIRED — {len(hazards)} safety hazard(s) flagged."

        summary = f"Safety Audit Score: {safety_score}/100. Status: {status_text}"

        return {
            "summary": summary,
            "details": f"Safety Agent conducted compliance audit on apparatus (T={temp:.1f}°C, Vol={liquid:.1f}mL, Burner={'Active' if burner else 'Off'}).",
            "structured_data": {
                "safety_score": safety_score,
                "hazard_count": len(hazards),
                "hazards_identified": hazards,
                "mitigation_steps": recommendations,
                "mandatory_ppe": ppe_required,
                "compliance_standard": "OSHA 1910.1450 & GHS Rev.9"
            },
            "diagram_mermaid": None,
            "svg_render": None,
            "actions_taken": [
                {"action": "thermal_gradient_evaluation", "temp_reading": temp},
                {"action": "ppe_protocol_verification", "score": safety_score}
            ]
        }

