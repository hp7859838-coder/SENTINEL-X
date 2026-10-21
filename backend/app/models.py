"""
SQLAlchemy database models for SENTINEL-X.
"""
from datetime import datetime, timezone
import json
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class DetectionRuleModel(Base):
    __tablename__ = "detection_rules"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(64), nullable=False, index=True)
    severity = Column(String(32), nullable=False)
    score_weight = Column(Integer, nullable=False, default=25)
    pattern = Column(Text, nullable=False)  # Regex pattern for transparent matching
    is_enabled = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "severity": self.severity,
            "score_weight": self.score_weight,
            "pattern": self.pattern,
            "is_enabled": self.is_enabled,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class EventLogModel(Base):
    __tablename__ = "event_logs"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now, index=True)
    event_type = Column(String(64), nullable=False, index=True)
    summary = Column(String(255), nullable=False)
    severity = Column(String(32), nullable=False, index=True)
    risk_score = Column(Integer, nullable=True)
    decision = Column(String(32), nullable=True, index=True)
    reason = Column(Text, nullable=False)
    details_json = Column(Text, nullable=True)
    related_id = Column(String(64), nullable=True, index=True)

    def to_dict(self):
        details = {}
        if self.details_json:
            try:
                details = json.loads(self.details_json)
            except Exception:
                details = {"raw": self.details_json}

        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "event_type": self.event_type,
            "summary": self.summary,
            "severity": self.severity,
            "risk_score": self.risk_score,
            "decision": self.decision,
            "reason": self.reason,
            "details": details,
            "related_id": self.related_id,
        }


class ApprovalRequestModel(Base):
    __tablename__ = "approval_requests"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now, index=True)
    action_type = Column(String(64), nullable=False)
    resource = Column(String(255), nullable=False)
    parameters_json = Column(Text, nullable=False)
    agent_id = Column(String(64), nullable=False, default="simulated-agent-01")
    status = Column(String(32), nullable=False, default="PENDING", index=True)  # PENDING, APPROVED, REJECTED
    policy_reason = Column(Text, nullable=False)
    reviewer_decision = Column(String(32), nullable=True)
    reviewer_reason = Column(Text, nullable=True)
    reviewed_by = Column(String(64), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    def to_dict(self):
        params = {}
        if self.parameters_json:
            try:
                params = json.loads(self.parameters_json)
            except Exception:
                params = {"raw": self.parameters_json}

        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "action_type": self.action_type,
            "resource": self.resource,
            "parameters": params,
            "agent_id": self.agent_id,
            "status": self.status,
            "policy_reason": self.policy_reason,
            "reviewer_decision": self.reviewer_decision,
            "reviewer_reason": self.reviewer_reason,
            "reviewed_by": self.reviewed_by,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
        }
