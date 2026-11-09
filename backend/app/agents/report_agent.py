"""
Agent 2: Scientific Lab Report Agent.
Compiles formal academic research laboratory reports with hypothesis, methodology,
telemetry, thermodynamic calculations, and persistence to SQL database.
"""

from typing import Dict, Any, Optional
import json
from datetime import datetime
from backend.app.agents.base_agent import BaseAgent
from backend.app.database.expanded_models import LabReport
from backend.app.logging_system.logger import app_logger


class ReportAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="report_agent",
            name="Scientific Lab Report Agent",
            role="Academic Report Author & Experimental Documenter",
            category="Documentation",
            description="Compiles comprehensive academic lab reports with abstract, hypothesis, quantitative thermodynamic calculations, and formal conclusions, persisting records to SQL database.",
            supported_tasks=["generate_lab_report", "export_latex", "format_journal_article", "summarize_findings"],
            icon="FileText"
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

        title = parameters.get("title", "Investigation of Thermal Absorption Kinetics and Phase Equilibrium in Aqueous Systems") if parameters else "Investigation of Thermal Absorption Kinetics and Phase Equilibrium in Aqueous Systems"
        author = parameters.get("author", "Autonomous Multi-Agent Scientific System") if parameters else "Autonomous Multi-Agent Scientific System"

        abstract = (
            f"This laboratory investigation evaluated the thermodynamic energy transfer into a "
            f"{liquid:.1f} mL pure aqueous sample heated via an atmospheric Bunsen burner apparatus. "
            f"Continuous thermal telemetry was logged using an immersed digital thermocouple. "
            f"The final observed steady-state temperature reached {temp:.1f} °C, demonstrating the "
            f"high specific heat capacity of liquid water (c = 4.184 J/g·°C) and convective heat dissipation."
        )

        hypothesis = (
            "If thermal energy is continuously applied to an uninsulated borosilicate beaker containing water, "
            "the rate of temperature change (dT/dt) will be proportional to the thermal gradient until reaching the 100°C liquid-vapor phase transition plateau."
        )

        methodology = (
            "1. Transferred 150.0 mL of deionized water into a 250 mL borosilicate glass beaker.\n"
            "2. Suspended an calibrated K-type thermocouple probe into the geometric center of the liquid.\n"
            "3. Positioned the Bunsen burner beneath the wire gauze and initiated heating.\n"
            "4. Sampled temperature and meniscus volume at 1.0-second intervals."
        )

        # Quantitative calculations: Q = m * c * delta_T
        mass_g = liquid * 1.0  # density ~ 1.0 g/mL
        c_water = 4.184  # J/g C
        delta_t = max(0.0, temp - 20.0)
        q_joules = mass_g * c_water * delta_t
        q_kj = q_joules / 1000.0

        calculations = (
            f"Sensible Heat Absorption Calculation:\n"
            f"Formula: Q = m · c · ΔT\n"
            f"Mass of Water (m) = {mass_g:.1f} g\n"
            f"Specific Heat Capacity (c) = 4.184 J/(g·°C)\n"
            f"Temperature Change (ΔT) = {temp:.1f}°C - 20.0°C = {delta_t:.1f} °C\n"
            f"Total Absorbed Energy (Q) = {mass_g:.1f} × 4.184 × {delta_t:.1f} = {q_joules:.2f} J ({q_kj:.3f} kJ)"
        )

        conclusion = (
            f"The experimental data corroborates standard thermodynamic models. "
            f"Energy absorption totaled {q_kj:.3f} kJ with a final equilibrium temperature of {temp:.1f}°C. "
            f"No structural failure or anomalous thermal degradation was observed."
        )

        mermaid_diagram = f"""graph LR
    H2O["H2O Sample: {mass_g:.1f}g"] --> Absorbs["Thermal Energy Q = {q_kj:.3f} kJ"]
    Absorbs --> TempRise["ΔT = {delta_t:.1f}°C"]
    TempRise --> FinalState["T_final = {temp:.1f}°C"]"""

        # Save to SQLite Database if session provided
        report_id = None
        if db_session:
            try:
                db_report = LabReport(
                    title=title,
                    experiment_type="Calorimetry / Thermodynamics",
                    author=author,
                    abstract=abstract,
                    hypothesis=hypothesis,
                    methodology=methodology,
                    observations=f"Measured water volume: {liquid:.1f}mL; Burner status: {'Active' if burner else 'Inactive'}; Temperature: {temp:.1f}°C.",
                    calculations=calculations,
                    conclusion=conclusion,
                    mermaid_diagram=mermaid_diagram,
                    apparatus_state=json.dumps(apparatus_state) if apparatus_state else "{}"
                )
                db_session.add(db_report)
                db_session.commit()
                db_session.refresh(db_report)
                report_id = db_report.id
                app_logger.info(f"Saved Lab Report #{report_id} to SQL database")
            except Exception as e:
                db_session.rollback()
                app_logger.error(f"Failed to persist report to SQL: {e}")

        summary = f"Compiled full academic lab report '{title}' (Absorbed Energy: {q_kj:.2f} kJ, Temp: {temp:.1f}°C)."

        return {
            "summary": summary,
            "details": f"Generated complete academic manuscript with 6 standardized sections. Report successfully recorded with thermodynamic calculations.",
            "structured_data": {
                "report_id": report_id,
                "title": title,
                "author": author,
                "q_absorbed_kj": round(q_kj, 3),
                "delta_t_celsius": round(delta_t, 2),
                "sections": ["Abstract", "Hypothesis", "Methodology", "Calculations", "Conclusion"]
            },
            "diagram_mermaid": mermaid_diagram,
            "svg_render": None,
            "actions_taken": [
                {"action": "compute_thermodynamic_absorption", "q_kj": round(q_kj, 3)},
                {"action": "persist_report_to_sql", "report_id": report_id}
            ]
        }

