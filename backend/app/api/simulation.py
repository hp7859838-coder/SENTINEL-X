"""
Threat Simulation Lab API endpoints.
Executes security validation scenarios across prompt scanning and firewall policies.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import SimulationScenario, SimulationResult, BatchSimulationResponse
from app.services.simulation import get_all_scenarios, execute_single_scenario, execute_batch_simulation

router = APIRouter(prefix="/api/simulation", tags=["Threat Simulation Lab"])


@router.get("/scenarios", response_model=List[SimulationScenario])
def list_scenarios():
    """Lists the 8 predefined threat simulation scenarios."""
    return get_all_scenarios()


@router.post("/run/{scenario_id}", response_model=SimulationResult)
def run_single_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """Executes a single threat scenario and evaluates pass/fail outcome."""
    try:
        return execute_single_scenario(scenario_id, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/run-all", response_model=BatchSimulationResponse)
def run_all_scenarios(db: Session = Depends(get_db)):
    """Executes the full simulation test suite and computes overall success rate."""
    return execute_batch_simulation(db)
