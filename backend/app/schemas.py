"""
Pydantic schemas for request validation and response serialization.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ----------------------
# Prompt Scanner Schemas
# ----------------------

class ScanRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000, description="Untrusted text to scan")
    input_type: Optional[str] = Field("text", description="Detected or specified type: text, markdown, json")


class MatchedRuleDetail(BaseModel):
    rule_id: str
    rule_name: str
    category: str
    severity: str
    weight: int
    evidence: str
    explanation: str


class ScanResult(BaseModel):
    scan_id: str
    timestamp: str
    risk_score: int = Field(..., ge=0, le=100)
    risk_label: str  # LOW, MODERATE, HIGH, CRITICAL
    matched_rules: List[MatchedRuleDetail]
    explanation: str
    input_preview: str
    input_type: str
    character_count: int
    confidence_disclaimer: str = (
        "Notice: Rule-based heuristics are probabilistic and explainable. "
        "No scanner catches 100% of adversarial injections or guarantees zero false positives."
    )


# ----------------------
# Action Firewall Schemas
# ----------------------

class ActionEvaluateRequest(BaseModel):
    action_type: str = Field(..., description="Simulated action identifier")
    resource: str = Field(..., description="Simulated target resource")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Action parameters")
    agent_id: Optional[str] = Field("sentinel-agent-01", description="Identifier of requesting agent")


class ActionEvaluateResponse(BaseModel):
    decision_id: str
    timestamp: str
    action_type: str
    resource: str
    parameters: Dict[str, Any]
    decision: str  # ALLOW, BLOCK, REQUIRE_APPROVAL
    reason: str
    requires_approval: bool
    approval_request_id: Optional[str] = None
    policy_name: str
    is_simulated: bool = True
    disclaimer: str = "This is a strictly simulated policy gateway. No OS commands or arbitrary network calls are executed."


# ----------------------
# Approval Workflow Schemas
# ----------------------

class ApprovalDecisionRequest(BaseModel):
    decision: str = Field(..., pattern="^(APPROVE|REJECT)$", description="APPROVE or REJECT")
    reason: str = Field(..., min_length=3, max_length=500, description="Justification by reviewer")
    reviewer: Optional[str] = Field("sec-admin", max_length=64)


class ApprovalRequestResponse(BaseModel):
    id: str
    timestamp: str
    action_type: str
    resource: str
    parameters: Dict[str, Any]
    agent_id: str
    status: str
    policy_reason: str
    reviewer_decision: Optional[str] = None
    reviewer_reason: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None


# ----------------------
# Detection Rule Schemas
# ----------------------

class DetectionRuleResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    severity: str
    score_weight: int
    pattern: str
    is_enabled: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class DetectionRuleUpdateRequest(BaseModel):
    is_enabled: Optional[bool] = None
    score_weight: Optional[int] = Field(None, ge=1, le=100)
    severity: Optional[str] = Field(None, pattern="^(LOW|MODERATE|HIGH|CRITICAL)$")


# ----------------------
# Threat Simulation Lab Schemas
# ----------------------

class SimulationScenario(BaseModel):
    id: str
    name: str
    description: str
    category: str  # SCANNER or FIREWALL
    sample_input: Optional[str] = None
    sample_action: Optional[Dict[str, Any]] = None
    expected_outcome: str
    expected_decision: str


class SimulationResult(BaseModel):
    scenario_id: str
    scenario_name: str
    category: str
    timestamp: str
    expected_outcome: str
    actual_outcome: str
    passed: bool
    details: Dict[str, Any]


class BatchSimulationResponse(BaseModel):
    timestamp: str
    total_scenarios: int
    passed_count: int
    failed_count: int
    success_rate: float
    results: List[SimulationResult]


# ----------------------
# Audit Event Schemas
# ----------------------

class EventLogResponse(BaseModel):
    id: str
    timestamp: str
    event_type: str
    summary: str
    severity: str
    risk_score: Optional[int] = None
    decision: Optional[str] = None
    reason: str
    details: Dict[str, Any]
    related_id: Optional[str] = None


# ----------------------
# Dashboard Metrics Schemas
# ----------------------

class SeverityDistribution(BaseModel):
    low: int
    moderate: int
    high: int
    critical: int
    info: int


class DashboardMetrics(BaseModel):
    total_scanned_events: int
    flagged_inputs: int
    high_and_critical_findings: int
    allowed_actions: int
    blocked_actions: int
    pending_approval_requests: int
    total_audit_events: int
    severity_distribution: SeverityDistribution
    recent_events: List[EventLogResponse]
    latest_decisions: List[Dict[str, Any]]


# ----------------------
# Export Report Schemas
# ----------------------

class ConsolidatedReport(BaseModel):
    report_id: str
    generated_at: str
    system_version: str
    metrics_summary: DashboardMetrics
    scans: List[Dict[str, Any]]
    firewall_decisions: List[Dict[str, Any]]
    approval_requests: List[Dict[str, Any]]
    rules_inventory: List[DetectionRuleResponse]
    simulation_results: Optional[List[SimulationResult]] = None
