"""
Detection Rules Management API endpoints.
Inspect and modify rule states and score weights without dynamic code execution.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DetectionRuleModel, EventLogModel
from app.schemas import DetectionRuleResponse, DetectionRuleUpdateRequest
from app.services.scanner import DEFAULT_RULES, init_default_rules
import json
import uuid

router = APIRouter(prefix="/api/rules", tags=["Detection Rules"])


@router.get("", response_model=List[DetectionRuleResponse])
def get_all_rules(
    category: Optional[str] = Query(None, description="Filter by rule category"),
    enabled: Optional[bool] = Query(None, description="Filter by active state"),
    db: Session = Depends(get_db),
):
    """Retrieves all detection rules configured in the system."""
    query = db.query(DetectionRuleModel)
    if category:
        query = query.filter(DetectionRuleModel.category == category)
    if enabled is not None:
        query = query.filter(DetectionRuleModel.is_enabled == enabled)
    rules = query.order_by(DetectionRuleModel.category, DetectionRuleModel.id).all()
    return [DetectionRuleResponse(**r.to_dict()) for r in rules]


@router.get("/{rule_id}", response_model=DetectionRuleResponse)
def get_rule_detail(rule_id: str, db: Session = Depends(get_db)):
    """Retrieves a single detection rule by ID."""
    rule = db.query(DetectionRuleModel).filter(DetectionRuleModel.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail=f"Rule '{rule_id}' not found.")
    return DetectionRuleResponse(**rule.to_dict())


@router.patch("/{rule_id}", response_model=DetectionRuleResponse)
def update_rule(
    rule_id: str,
    payload: DetectionRuleUpdateRequest,
    db: Session = Depends(get_db),
):
    """
    Updates rule properties (is_enabled, score_weight, severity).
    Never executes arbitrary dynamic code or unvalidated user regex.
    """
    rule = db.query(DetectionRuleModel).filter(DetectionRuleModel.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail=f"Rule '{rule_id}' not found.")

    changes = []
    if payload.is_enabled is not None:
        changes.append(f"is_enabled: {rule.is_enabled} -> {payload.is_enabled}")
        rule.is_enabled = payload.is_enabled

    if payload.score_weight is not None:
        changes.append(f"score_weight: {rule.score_weight} -> {payload.score_weight}")
        rule.score_weight = payload.score_weight

    if payload.severity is not None:
        changes.append(f"severity: {rule.severity} -> {payload.severity}")
        rule.severity = payload.severity

    if changes:
        # Audit rule modification
        evt = EventLogModel(
            id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            event_type="RULE_UPDATE",
            summary=f"Rule {rule.id} updated: {', '.join(changes)}",
            severity="INFO",
            reason=f"Administrator configuration updated for rule {rule.id}.",
            related_id=rule.id,
            details_json=json.dumps({"rule_id": rule.id, "changes": changes}),
        )
        db.add(evt)
        db.commit()
        db.refresh(rule)

    return DetectionRuleResponse(**rule.to_dict())


@router.post("/reset", response_model=List[DetectionRuleResponse])
def reset_rules_to_defaults(db: Session = Depends(get_db)):
    """Resets all detection rules to default factory values."""
    db.query(DetectionRuleModel).delete()
    db.commit()
    init_default_rules(db)
    rules = db.query(DetectionRuleModel).order_by(DetectionRuleModel.id).all()
    return [DetectionRuleResponse(**r.to_dict()) for r in rules]
