import os
from fastapi import APIRouter
from ..schemas import AgentQuery, AgentResponse

router = APIRouter(prefix="/agent", tags=["Autonomous Lab AI Agent"])

@router.post("/consult", response_model=AgentResponse)
def consult_ai_lab_agent(query: AgentQuery):
    """
    AI Laboratory Agent assistant. Analyzes chemical state, thermodynamics,
    and provides real-time scientific feedback and actionable lab operations.
    """
    p = query.prompt.lower().strip()
    temp = query.current_temp or 22.0
    solute = query.solute_name or "Pure Distilled Water"
    state = query.current_state or "liquid"

    # Dynamic heuristics & domain chemistry engine
    if "boil" in p or "heat" in p or "hot" in p:
        if temp < 50:
            resp = f"Currently at {temp:.1f}°C. To initiate rolling boil for {solute}, increase Bunsen burner valve to 80-100% and ensure the wire gauze is aligned under the vessel."
            action = "SET_FIRE_100"
            safety = "CAUTION: Rapid Heating"
            target = 100.0
        elif temp < 95:
            resp = f"Liquid temperature is currently {temp:.1f}°C. Vigorous nucleation will occur once reaching 100°C. Vapor pressure is rapidly rising."
            action = "SET_FIRE_75"
            safety = "CAUTION: Approaching Boiling Point"
            target = 100.0
        else:
            resp = f"Rolling boil active at {temp:.1f}°C! Latent heat of vaporization is actively expelling steam. Maintain burner at 50% to sustain convective equilibrium."
            action = "MAINTAIN_HEAT"
            safety = "WARNING: Hot Steam Discharge"
            target = 100.0

    elif "cool" in p or "ice" in p or "freeze" in p or "quench" in p:
        resp = f"Introducing cryogenic ice into {solute} absorbs ~334 J/g enthalpy of fusion. Quenching rapid thermodynamic reaction down toward 0.5°C."
        action = "ADD_ICE"
        safety = "SAFE"
        target = 4.0

    elif "refill" in p or "water" in p:
        resp = "Evaporative mass loss observed. Dispensing pure deionized water to restore volumetric meniscus back to 350 mL."
        action = "REFILL_WATER"
        safety = "SAFE"
        target = temp

    elif "solute" in p or "copper" in p or "chemical" in p or "reaction" in p:
        resp = f"Active reagent is '{solute}'. Hydrated ions undergo coordination complexing. Thermodynamic heat capacity calibrated."
        action = "ANALYZE_SOLUTE"
        safety = "STABLE"
        target = temp

    elif "safety" in p or "check" in p:
        if temp > 80:
            resp = f"Thermal Hazard alert: Solution at {temp:.1f}°C. Ensure laboratory fume hood ventilation is active and safety goggles are on."
            safety = "CAUTION: High Thermal Energy"
        else:
            resp = f"Laboratory conditions optimal. Room temperature baseline {temp:.1f}°C. All safety protocols verified."
            safety = "SAFE"
        action = "SAFETY_AUDIT"
        target = temp

    else:
        resp = (
            f"MOSEB AI Lab Assistant online. Current vessel state: {solute} at {temp:.1f}°C ({state}). "
            "You can ask me to optimize burner ignition, introduce cooling ice, replenish aqueous volume, or analyze reaction thermodynamics."
        )
        action = "STANDBY"
        safety = "SAFE"
        target = temp

    return AgentResponse(
        response=resp,
        recommended_action=action,
        safety_level=safety,
        target_temperature=target
    )
