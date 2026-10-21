"""
Agent Action Firewall for SENTINEL-X.
Enforces backend security policies on simulated agent operations.
Fails closed on unknown actions and operates independently of text scanner scores.
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models import ApprovalRequestModel, EventLogModel
from app.schemas import ActionEvaluateResponse


# Safe Simulated Actions Catalog
KNOWN_ACTIONS = {
    "READ_PUBLIC_DOCUMENT": {
        "policy": "ALLOW_PUBLIC_READS",
        "default_decision": "ALLOW",
        "description": "Read publicly accessible synthetic documentation",
    },
    "READ_RESTRICTED_DOCUMENT": {
        "policy": "BLOCK_RESTRICTED_ACCESS",
        "default_decision": "BLOCK",
        "description": "Access confidential or restricted synthetic files",
    },
    "TRANSFER_SYNTHETIC_DATA": {
        "policy": "BLOCK_DATA_EGRESS",
        "default_decision": "BLOCK",
        "description": "Outbound transmission of synthetic data payload",
    },
    "MODIFY_MOCK_RESOURCE": {
        "policy": "REQUIRE_APPROVAL_RESOURCE_MUTATION",
        "default_decision": "REQUIRE_APPROVAL",
        "description": "Altering state or configuration of a mock resource",
    },
    "REQUEST_SIMULATED_PRIVILEGE": {
        "policy": "REQUIRE_APPROVAL_ELEVATION",
        "default_decision": "REQUIRE_APPROVAL",
        "description": "Escalating simulated permissions or requesting supervisor tokens",
    },
}


def evaluate_agent_action(
    action_type: str,
    resource: str,
    parameters: Dict[str, Any],
    agent_id: str,
    db: Session,
) -> ActionEvaluateResponse:
    """
    Evaluates an agent action against strict server-side policy rules.
    Ignores any client-submitted decision. Fails closed.
    """
    decision_id = f"DEC-{uuid.uuid4().hex[:8].upper()}"
    timestamp_str = datetime.now(timezone.utc).isoformat()

    # Fail closed on unknown or empty action type
    if not action_type or action_type not in KNOWN_ACTIONS:
        decision = "BLOCK"
        policy_name = "DEFAULT_DENY_FAIL_CLOSED"
        reason = (
            f"Action type '{action_type}' is unrecognized or malformed. "
            "Sentinel-X policy engine rejects unrecognized actions by default."
        )
        requires_approval = False
        approval_id = None
    else:
        action_spec = KNOWN_ACTIONS[action_type]
        policy_name = action_spec["policy"]
        default_decision = action_spec["default_decision"]

        # Policy rule-set checks
        if action_type == "READ_PUBLIC_DOCUMENT":
            # Verify resource pattern is indeed public
            if "restricted" in resource.lower() or "secret" in resource.lower():
                decision = "BLOCK"
                reason = "Target resource path violates public read scope: suspicious path indicator detected."
                requires_approval = False
                approval_id = None
            else:
                decision = "ALLOW"
                reason = "Action matches policy ALLOW_PUBLIC_READS for verified public synthetic resources."
                requires_approval = False
                approval_id = None

        elif action_type == "READ_RESTRICTED_DOCUMENT":
            decision = "BLOCK"
            reason = (
                f"Policy BLOCK_RESTRICTED_ACCESS strictly denies direct access to '{resource}'. "
                "Simulated restricted document protection enforced."
            )
            requires_approval = False
            approval_id = None

        elif action_type == "TRANSFER_SYNTHETIC_DATA":
            decision = "BLOCK"
            destination = parameters.get("destination", "unknown")
            reason = (
                f"Policy BLOCK_DATA_EGRESS triggered. Simulated exfiltration attempt to '{destination}' "
                "has been quarantined."
            )
            requires_approval = False
            approval_id = None

        elif action_type in ("MODIFY_MOCK_RESOURCE", "REQUEST_SIMULATED_PRIVILEGE"):
            decision = "REQUIRE_APPROVAL"
            reason = (
                f"Operation '{action_type}' on '{resource}' has elevated impact. "
                "Dispatched to human reviewer queue."
            )
            requires_approval = True

            # Register in ApprovalQueue
            approval_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"
            approval_req = ApprovalRequestModel(
                id=approval_id,
                action_type=action_type,
                resource=resource,
                parameters_json=json.dumps(parameters or {}),
                agent_id=agent_id,
                status="PENDING",
                policy_reason=reason,
            )
            db.add(approval_req)

            # Record approval event
            appr_event = EventLogModel(
                id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
                event_type="APPROVAL_REQUEST",
                summary=f"Approval requested for {action_type} on {resource}",
                severity="MODERATE",
                decision="REQUIRE_APPROVAL",
                reason=reason,
                related_id=approval_id,
                details_json=json.dumps({
                    "action_type": action_type,
                    "resource": resource,
                    "agent_id": agent_id,
                    "parameters": parameters,
                }),
            )
            db.add(appr_event)
        else:
            decision = "BLOCK"
            reason = "Failed closed due to unspecified policy branch."
            requires_approval = False
            approval_id = None

    # Record Firewall Event into Audit Trail
    severity = "CRITICAL" if decision == "BLOCK" else ("MODERATE" if decision == "REQUIRE_APPROVAL" else "INFO")
    event = EventLogModel(
        id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
        event_type="FIREWALL_DECISION",
        summary=f"Firewall decision {decision} for {action_type}",
        severity=severity,
        decision=decision,
        reason=reason,
        related_id=decision_id,
        details_json=json.dumps({
            "action_type": action_type,
            "resource": resource,
            "parameters": parameters,
            "agent_id": agent_id,
            "policy": policy_name,
            "requires_approval": requires_approval,
            "approval_request_id": approval_id,
        }),
    )
    db.add(event)
    db.commit()

    return ActionEvaluateResponse(
        decision_id=decision_id,
        timestamp=timestamp_str,
        action_type=action_type,
        resource=resource,
        parameters=parameters or {},
        decision=decision,
        reason=reason,
        requires_approval=requires_approval,
        approval_request_id=approval_id,
        policy_name=policy_name,
        is_simulated=True,
    )
