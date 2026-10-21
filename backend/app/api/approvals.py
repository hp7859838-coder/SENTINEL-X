"""
Approval Queue API endpoints.
Provides review queue management, decision processing, and supervisor auditing.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ApprovalRequestResponse, ApprovalDecisionRequest
from app.services.approval import list_approvals, get_approval_by_id, process_approval_decision

router = APIRouter(prefix="/api/approvals", tags=["Approval Queue"])


@router.get("", response_model=List[ApprovalRequestResponse])
def get_approvals(
    status: Optional[str] = Query(None, description="Filter by status: PENDING, APPROVED, REJECTED"),
    db: Session = Depends(get_db),
):
    """Retrieves all simulated action approval requests."""
    return list_approvals(db, status=status)


@router.get("/{approval_id}", response_model=ApprovalRequestResponse)
def get_approval_detail(approval_id: str, db: Session = Depends(get_db)):
    """Retrieves specific approval request details."""
    req = get_approval_by_id(approval_id, db)
    if not req:
        raise HTTPException(status_code=404, detail=f"Approval request '{approval_id}' not found.")
    return ApprovalRequestResponse(**req.to_dict())


@router.post("/{approval_id}/decision", response_model=ApprovalRequestResponse)
def submit_approval_decision(
    approval_id: str,
    payload: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
):
    """
    Submits a human reviewer verdict (APPROVE or REJECT) for a pending simulated action.
    Fails if the request was already decided or does not exist.
    """
    return process_approval_decision(approval_id, payload, db)
