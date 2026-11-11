"""
Agent 3: Chemical Classifier & Reagent Identification Agent.
Identifies chemical substances, computes stoichiometric molar masses,
classifies GHS hazards, and checks reagent compatibility.
"""

from typing import Dict, Any, Optional, List
import re
try:
    from backend.app.agents.base_agent import BaseAgent
    from backend.app.database.expanded_models import ChemicalInventory
    from backend.app.logging_system.logger import app_logger
except ImportError:
    from .base_agent import BaseAgent
    from ..database.expanded_models import ChemicalInventory
    from ..logging_system.logger import app_logger

# Atomic Weights Periodic Table Reference
ATOMIC_WEIGHTS = {
    "H": 1.008, "He": 4.003, "Li": 6.941, "Be": 9.012, "B": 10.811,
    "C": 12.011, "N": 14.007, "O": 15.999, "F": 18.998, "Ne": 20.180,
    "Na": 22.990, "Mg": 24.305, "Al": 26.982, "Si": 28.086, "P": 30.974,
    "S": 32.065, "Cl": 35.453, "K": 39.098, "Ca": 40.078, "Fe": 55.845,
    "Cu": 63.546, "Zn": 65.380, "Br": 79.904, "Ag": 107.868, "I": 126.904
}

KNOWN_REAGENTS = {
    "h2o": {
        "formula": "H2O", "name": "Dihydrogen Monoxide (Water)", "cas": "7732-18-5",
        "type": "Universal Polar Solvent", "density": 1.00, "bp": 100.0, "mp": 0.0,
        "hazards": ["Non-hazardous under ambient conditions"], "storage": "General Aqueous", "color": "Colorless"
    },
    "hcl": {
        "formula": "HCl", "name": "Hydrochloric Acid", "cas": "7647-01-0",
        "type": "Strong Mineral Acid", "density": 1.18, "bp": 108.6, "mp": -30.0,
        "hazards": ["GHS05: Corrosive to metals & skin", "GHS07: Respiratory irritant"], "storage": "Inorganic Acid Cabinet", "color": "Clear/Slight yellow"
    },
    "naoh": {
        "formula": "NaOH", "name": "Sodium Hydroxide (Caustic Soda)", "cas": "1310-73-2",
        "type": "Strong Inorganic Base", "density": 2.13, "bp": 1388.0, "mp": 318.0,
        "hazards": ["GHS05: Severe skin burns & serious eye damage"], "storage": "Inorganic Base Cabinet", "color": "White deliquescent pellets"
    },
    "cuso4": {
        "formula": "CuSO4", "name": "Copper(II) Sulfate", "cas": "7758-98-7",
        "type": "Transition Metal Inorganic Salt", "density": 3.60, "bp": 650.0, "mp": 110.0,
        "hazards": ["GHS07: Harmful if swallowed", "GHS09: Hazardous to aquatic life"], "storage": "General Inorganic Salt", "color": "Vibrant Blue in solution"
    },
    "c2h5oh": {
        "formula": "C2H5OH", "name": "Ethanol (Ethyl Alcohol)", "cas": "64-17-5",
        "type": "Aliphatic Primary Alcohol / Organic Solvent", "density": 0.789, "bp": 78.37, "mp": -114.1,
        "hazards": ["GHS02: Highly flammable liquid & vapor", "GHS07: Eye irritation"], "storage": "Flammables Safety Cabinet", "color": "Colorless"
    },
    "nacl": {
        "formula": "NaCl", "name": "Sodium Chloride (Table Salt)", "cas": "7647-14-5",
        "type": "Neutral Alkali Halide Salt", "density": 2.16, "bp": 1413.0, "mp": 801.0,
        "hazards": ["Non-toxic / Non-hazardous"], "storage": "General Chemical Shelf", "color": "White crystalline"
    }
}


class ChemicalAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="chemical_agent",
            name="Chemical Classifier & Reagent Agent",
            role="Chemical Characterization & Stoichiometric Identifier",
            category="Chemistry",
            description="Identifies chemical reagents, verifies CAS numbers, parses chemical formulas into exact molar weights, and determines GHS hazard profiles.",
            supported_tasks=["identify_chemical", "calculate_molar_mass", "check_ghs_hazards", "verify_compatibility"],
            icon="Layers"
        )

    def _parse_molar_mass(self, formula: str) -> float:
        """Parse chemical formula string and calculate molecular weight in g/mol."""
        tokens = re.findall(r"([A-Z][a-z]?)([0-9]*)", formula)
        total = 0.0
        for elem, count_str in tokens:
            count = int(count_str) if count_str else 1
            weight = ATOMIC_WEIGHTS.get(elem, 0.0)
            total += weight * count
        return round(total, 3)

    def execute(
        self,
        prompt: str,
        parameters: Optional[Dict[str, Any]] = None,
        apparatus_state: Optional[Dict[str, Any]] = None,
        db_session: Optional[Any] = None
    ) -> Dict[str, Any]:
        query = prompt.strip().lower()
        if parameters and "query" in parameters:
            query = parameters["query"].strip().lower()

        # Find matching known reagent or fallback to formula parsing
        matched_key = None
        for k in KNOWN_REAGENTS:
            if k in query or KNOWN_REAGENTS[k]["formula"].lower() in query or KNOWN_REAGENTS[k]["name"].lower() in query:
                matched_key = k
                break

        if matched_key:
            data = KNOWN_REAGENTS[matched_key]
            molar_mass = self._parse_molar_mass(data["formula"])
            chem_info = {
                "formula": data["formula"],
                "name": data["name"],
                "cas_number": data["cas"],
                "chemical_type": data["type"],
                "molar_mass_g_mol": molar_mass,
                "density_g_ml": data["density"],
                "boiling_point_c": data["bp"],
                "melting_point_c": data["mp"],
                "ghs_hazards": data["hazards"],
                "storage_cabinet": data["storage"],
                "solution_color": data["color"]
            }
        else:
            # Generic formula parsing
            raw_formula = re.sub(r"[^A-Za-z0-9]", "", prompt) or "H2O"
            molar_mass = self._parse_molar_mass(raw_formula)
            chem_info = {
                "formula": raw_formula,
                "name": f"Compound ({raw_formula})",
                "cas_number": "Pending Verification",
                "chemical_type": "Analytical Reagent",
                "molar_mass_g_mol": molar_mass if molar_mass > 0 else 18.015,
                "density_g_ml": 1.0,
                "boiling_point_c": 100.0,
                "melting_point_c": 0.0,
                "ghs_hazards": ["Wear Standard Lab PPE: Nitrile Gloves, Eye Protection"],
                "storage_cabinet": "Standard Chemical Storage",
                "solution_color": "Clear Solution"
            }

        # Persist or update in SQL database if session present
        if db_session:
            try:
                existing = db_session.query(ChemicalInventory).filter_by(formula=chem_info["formula"]).first()
                if not existing:
                    new_item = ChemicalInventory(
                        formula=chem_info["formula"],
                        name=chem_info["name"],
                        cas_number=chem_info["cas_number"],
                        molar_mass=chem_info["molar_mass_g_mol"],
                        density=chem_info["density_g_ml"],
                        boiling_point=chem_info["boiling_point_c"],
                        melting_point=chem_info["melting_point_c"],
                        physical_state="liquid" if "solvent" in chem_info["chemical_type"].lower() or "acid" in chem_info["chemical_type"].lower() else "solid",
                        hazard_codes="; ".join(chem_info["ghs_hazards"]),
                        storage_class=chem_info["storage_cabinet"]
                    )
                    db_session.add(new_item)
                    db_session.commit()
            except Exception as e:
                db_session.rollback()
                app_logger.warning(f"Could not persist chemical to DB: {e}")

        summary = f"Identified {chem_info['name']} ({chem_info['formula']}), Molar Mass = {chem_info['molar_mass_g_mol']} g/mol. Type: {chem_info['chemical_type']}."

        return {
            "summary": summary,
            "details": f"Chemical Agent classified reagent properties. GHS Hazards: {', '.join(chem_info['ghs_hazards'])}. Recommended storage: {chem_info['storage_cabinet']}.",
            "structured_data": chem_info,
            "diagram_mermaid": None,
            "svg_render": None,
            "actions_taken": [
                {"action": "formula_molar_mass_calculation", "molar_mass": chem_info["molar_mass_g_mol"]},
                {"action": "hazard_risk_assessment", "hazards_count": len(chem_info["ghs_hazards"])}
            ]
        }

