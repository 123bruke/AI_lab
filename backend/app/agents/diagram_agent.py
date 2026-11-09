"""
Agent 1: Diagram & Scientific Visualization Agent.
Generates dynamic Mermaid.js flowcharts, apparatus setups, phase diagrams,
and high-resolution SVG curves for lab reports.
"""

from typing import Dict, Any, Optional
import json
from backend.app.agents.base_agent import BaseAgent
from backend.app.logging_system.logger import app_logger


class DiagramAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="diagram_agent",
            name="Diagram & Visualization Agent",
            role="Technical Illustrator & Phase Diagram Generator",
            category="Visualization",
            description="Designs and renders technical lab diagrams, chemical flowcharts, reaction mechanisms, and thermodynamic SVG heating curves.",
            supported_tasks=["generate_mermaid", "heating_curve_svg", "titration_curve_svg", "apparatus_schematic"],
            icon="Activity"
        )

    def _generate_heating_curve_svg(self, temp_start: float = 20.0, temp_end: float = 100.0) -> str:
        """Generate a clean vector SVG thermodynamic heating curve."""
        svg = f"""<svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg" style="background:#09090b; border-radius:8px; font-family:monospace;">
  <!-- Grid Lines -->
  <line x1="50" y1="20" x2="50" y2="220" stroke="#27272a" stroke-width="2"/>
  <line x1="50" y1="220" x2="470" y2="220" stroke="#27272a" stroke-width="2"/>
  <line x1="50" y1="60" x2="470" y2="60" stroke="#27272a" stroke-dasharray="4"/>
  <line x1="50" y1="140" x2="470" y2="140" stroke="#27272a" stroke-dasharray="4"/>

  <!-- Temperature Curve (Heating) -->
  <path d="M 50 210 Q 150 180, 240 100 T 450 60" fill="none" stroke="#e11d48" stroke-width="3.5" stroke-linecap="round"/>

  <!-- Data Points -->
  <circle cx="50" cy="210" r="5" fill="#f43f5e" />
  <circle cx="240" cy="100" r="5" fill="#f43f5e" />
  <circle cx="450" cy="60" r="5" fill="#f43f5e" />

  <!-- Labels -->
  <text x="60" y="200" fill="#a1a1aa" font-size="11">Initial: {temp_start:.1f}°C</text>
  <text x="210" y="85" fill="#a1a1aa" font-size="11">Active Heating Phase</text>
  <text x="350" y="50" fill="#38bdf8" font-size="11">Boiling Plateau (100.0°C)</text>
  <text x="240" y="245" fill="#71717a" font-size="11" text-anchor="middle">Heating Duration (Seconds)</text>
  <text x="20" y="140" fill="#71717a" font-size="11" transform="rotate(-90 20,140)" text-anchor="middle">Temp (°C)</text>
</svg>"""
        return svg

    def execute(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        apparatus_state: Optional[Dict[str, Any]] = None,
        db_session: Optional[Any] = None
    ) -> Dict[str, Any]:
        params = parameters or {}
        temp = apparatus_state.get("temperature", 24.5) if apparatus_state else 24.5
        liquid = apparatus_state.get("waterLevel", 150.0) if apparatus_state else 150.0

        # Construct Mermaid Diagram
        mermaid_code = f"""graph TD
    A[Bunsen Burner System] -->|Thermal Energy Transfer Q| B(Borosilicate Beaker 250mL)
    B -->|Heat Absorption Q = mcΔT| C{{Water Sample: {liquid:.1f}mL}}
    C -->|Current Sensor Reading| D[K-Type Thermometer Probe: {temp:.1f}°C]
    D -->|Continuous Realtime Telemetry| E[Agentic Lab Logger & HUD]
    
    classDef apparatus fill:#18181b,stroke:#52525b,stroke-width:1.5px,color:#fafafa;
    classDef thermal fill:#450a0a,stroke:#dc2626,stroke-width:2px,color:#fca5a5;
    classDef sensor fill:#082f49,stroke:#0284c7,stroke-width:2px,color:#bae6fd;
    class A,B apparatus;
    class C thermal;
    class D,E sensor;"""

        svg_curve = self._generate_heating_curve_svg(temp_start=20.0, temp_end=max(temp, 100.0))

        summary = f"Generated technical thermodynamic flowchart and high-contrast SVG heating curve for current laboratory state ({temp:.1f}°C, {liquid:.1f}mL)."

        return {
            "summary": summary,
            "details": f"Diagram Agent parsed user prompt '{prompt}'. Successfully synthesized a Mermaid apparatus topology graph and SVG thermodynamic transition curve.",
            "structured_data": {
                "diagram_format": "mermaid_v10",
                "nodes": 5,
                "edges": 4,
                "svg_resolution": "500x260"
            },
            "diagram_mermaid": mermaid_code,
            "svg_render": svg_curve,
            "actions_taken": [
                {"action": "compile_mermaid_graph", "nodes_count": 5},
                {"action": "render_vector_svg_curve", "viewBox": "0 0 500 260"}
            ]
        }

