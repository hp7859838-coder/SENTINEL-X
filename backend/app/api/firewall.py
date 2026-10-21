"""
Agent Action Firewall API endpoints.
Enforces security policies on simulated agent operations.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ActionEvaluateRequest, ActionEvaluateResponse
from app.services.firewall import evaluate_agent_action, KNOWN_ACTIONS

router = APIRouter(prefix="/api/firewall", tags=["Action Firewall"])


ACTION_PRESETS = [
    {
        "action_type": "READ_PUBLIC_DOCUMENT",
        "name": "Read Public Synthetic Document",
        "resource": "synthetic_public/onboarding_guide.md",
        "parameters": {"page": 1, "format": "markdown"},
        "expected_policy": "ALLOW_PUBLIC_READS",
        "expected_decision": "ALLOW",
        "description": "Standard read of unclassified synthetic educational resource.",
    },
    {
        "action_type": "READ_RESTRICTED_DOCUMENT",
        "name": "Read Synthetic Restricted Document",
        "resource": "synthetic_restricted/financial_audit_2026.enc",
        "parameters": {"decryption_key": "dummy_simulated_key"},
        "expected_policy": "BLOCK_RESTRICTED_ACCESS",
        "expected_decision": "BLOCK",
        "description": "Unauthorized attempt to access classified synthetic business audit.",
    },
    {
        "action_type": "TRANSFER_SYNTHETIC_DATA",
        "name": "Transfer Synthetic Data Outbound",
        "resource": "customer_pii_vault",
        "parameters": {"destination": "https://external-exfil-webhook.xyz/ingest", "batch_size": 500},
        "expected_policy": "BLOCK_DATA_EGRESS",
        "expected_decision": "BLOCK",
        "description": "Attempt to transmit synthetic data outside trust perimeter.",
    },
    {
        "action_type": "MODIFY_MOCK_RESOURCE",
        "name": "Modify Mock Resource State",
        "resource": "mock_cluster/node_alpha",
        "parameters": {"desired_state": "drained", "drain_timeout_sec": 300},
        "expected_policy": "REQUIRE_APPROVAL_RESOURCE_MUTATION",
        "expected_decision": "REQUIRE_APPROVAL",
        "description": "State alteration requiring human operational authorization.",
    },
    {
        "action_type": "REQUEST_SIMULATED_PRIVILEGE",
        "name": "Request Simulated Privilege Elevation",
        "resource": "rbac_roles/admin_supervisor",
        "parameters": {"requested_ttl_minutes": 60, "reason": "emergency maintenance"},
        "expected_policy": "REQUIRE_APPROVAL_ELEVATION",
        "expected_decision": "REQUIRE_APPROVAL",
        "description": "Privilege escalation request routed to approval queue.",
    },
    {
        "action_type": "UNREGISTERED_SHELL_COMMAND",
        "name": "Unregistered / Malformed Action",
        "resource": "system_terminal",
        "parameters": {"command": "sh -c whoami"},
        "expected_policy": "DEFAULT_DENY_FAIL_CLOSED",
        "expected_decision": "BLOCK",
        "description": "Unknown action type. System fails closed and denies execution.",
    },
]


@router.post("/evaluate", response_model=ActionEvaluateResponse)
def evaluate_action(request: ActionEvaluateRequest, db: Session = Depends(get_db)):
    """
    Evaluates a proposed simulated agent action against server-enforced security policies.
    Guarantees fail-closed security for malformed or unknown operations.
    """
    return evaluate_agent_action(
        action_type=request.action_type,
        resource=request.resource,
        parameters=request.parameters or {},
        agent_id=request.agent_id or "simulated-agent-01",
        db=db,
    )


@router.get("/actions")
def get_action_catalog() -> List[Dict[str, Any]]:
    """Returns catalog of simulated actions and presets for interactive evaluation."""
    return ACTION_PRESETS
