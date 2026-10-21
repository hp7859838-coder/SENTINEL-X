"""
Approval workflow service for SENTINEL-X.
Manages reviewer queues, processes human authorizations, and writes immutable audit records.
"""
from datetime import datetime, timezone
import json
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import ApprovalRequestModel, EventLogModel
from app.schemas import ApprovalRequestResponse, ApprovalDecisionRequest


def list_approvals(db: Session, status: Optional[str] = None) -> List[ApprovalRequestResponse]:
    """Retrieves approval requests ordered newest first."""
    query = db.query(ApprovalRequestModel)
    if status:
        query = query.filter(ApprovalRequestModel.status == status.upper())
    records = query.order_by(ApprovalRequestModel.timestamp.desc()).all()
    return [ApprovalRequestResponse(**r.to_dict()) for r in records]


def get_approval_by_id(approval_id: str, db: Session) -> Optional[ApprovalRequestModel]:
    return db.query(ApprovalRequestModel).filter(ApprovalRequestModel.id == approval_id).first()


def process_approval_decision(
    approval_id: str,
    payload: ApprovalDecisionRequest,
    db: Session,
) -> ApprovalRequestResponse:
    """
    Applies human reviewer verdict (APPROVE or REJECT) to a pending approval request.
    Validates state machine transitions on the backend.
    """
    req = get_approval_by_id(approval_id, db)
    if not req:
        raise HTTPException(status_code=404, detail=f"Approval request '{approval_id}' not found.")

    if req.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=f"Approval request '{approval_id}' has already been processed with status '{req.status}'.",
        )

    decision_norm = payload.decision.upper()
    if decision_norm not in ("APPROVE", "REJECT"):
        raise HTTPException(status_code=400, detail="Invalid decision. Must be APPROVE or REJECT.")

    now_utc = datetime.now(timezone.utc)
    new_status = "APPROVED" if decision_norm == "APPROVE" else "REJECTED"

    req.status = new_status
    req.reviewer_decision = decision_norm
    req.reviewer_reason = payload.reason
    req.reviewed_by = payload.reviewer or "security-supervisor"
    req.reviewed_at = now_utc

    # Log to unified event trail
    severity = "INFO" if new_status == "APPROVED" else "MODERATE"
    event = EventLogModel(
        id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
        event_type="APPROVAL_OUTCOME",
        summary=f"Approval request {req.id} {new_status} by {req.reviewed_by}",
        severity=severity,
        decision=new_status,
        reason=payload.reason,
        related_id=req.id,
        details_json=json.dumps({
            "action_type": req.action_type,
            "resource": req.resource,
            "decision": new_status,
            "reviewed_by": req.reviewed_by,
            "reviewer_reason": payload.reason,
            "is_simulated": True,
        }),
    )
    db.add(event)
    db.commit()
    db.refresh(req)

    return ApprovalRequestResponse(**req.to_dict())
