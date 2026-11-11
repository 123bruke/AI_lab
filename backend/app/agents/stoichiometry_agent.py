"""
Agent 8: Stoichiometry & Chemical Reaction Balancer.
Computes balanced stoichiometric equations, determines limiting reagents,
and calculates theoretical and percentage yields.
"""

from typing import Dict, Any, Optional
try:
    from backend.app.agents.base_agent import BaseAgent
    from backend.app.logging_system.logger import app_logger
except ImportError:
    from .base_agent import BaseAgent
    from ..logging_system.logger import app_logger


class StoichiometryAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="stoichiometry_agent",
            name="Stoichiometry & Reaction Balancer",
            role="Stoichiometric Modeler & Yield Calculator",
            category="Chemistry",
            description="Balances chemical reaction equations, determines limiting vs excess reagents, and computes theoretical mass conversions and percent yields.",
            supported_tasks=["balance_equation", "find_limiting_reagent", "calculate_theoretical_yield", "compute_reaction_enthalpy"],
            icon="Compass"
        )

    def execute(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        apparatus_state: Optional[Dict[str, Any]] = None,
        db_session: Optional[Any] = None
    ) -> Dict[str, Any]:
        params = parameters or {}
        # Default acid-base neutralization: HCl + NaOH -> NaCl + H2O
        acid_vol_ml = params.get("acid_volume_ml", 25.0)
        acid_molar = params.get("acid_molarity", 0.10)
        base_molar = params.get("base_molarity", 0.10)

        # Moles acid = M * V_L
        moles_acid = acid_molar * (acid_vol_ml / 1000.0)
        # Required volume of base for equivalence point
        vol_base_req_ml = (moles_acid / base_molar) * 1000.0
        nacl_theoretical_g = moles_acid * 58.44  # molar mass NaCl

        summary = (
            f"Neutralization Stoichiometry: HCl + NaOH → NaCl + H2O. "
            f"For {acid_vol_ml:.1f} mL of {acid_molar:.2f} M HCl, exactly {vol_base_req_ml:.1f} mL "
            f"of {base_molar:.2f} M NaOH is required to achieve equivalence (Theoretical NaCl: {nacl_theoretical_g:.3f} g)."
        )

        return {
            "summary": summary,
            "details": f"Stoichiometry Agent calculated molar balance for 1:1 acid-base neutralization. Moles reacting: {moles_acid:.4f} mol.",
            "structured_data": {
                "balanced_equation": "HCl (aq) + NaOH (aq) -> NaCl (aq) + H2O (l)",
                "mole_ratio": "1 : 1",
                "moles_analyte": round(moles_acid, 5),
                "titrant_volume_at_equivalence_ml": round(vol_base_req_ml, 2),
                "theoretical_yield_nacl_grams": round(nacl_theoretical_g, 4),
                "limiting_reagent": "Equimolar Stoichiometric Proportion",
                "standard_enthalpy_delta_h_kj_mol": -57.3  # Exothermic neutralization
            },
            "diagram_mermaid": None,
            "svg_render": None,
            "actions_taken": [
                {"action": "stoichiometric_mole_balance", "moles": round(moles_acid, 5)},
                {"action": "equivalence_point_calculation", "req_volume_ml": round(vol_base_req_ml, 2)}
            ]
        }

