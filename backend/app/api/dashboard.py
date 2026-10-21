"""
Dashboard API endpoints for SENTINEL-X.
Aggregates live database records into authentic security metrics and telemetry.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EventLogModel, ApprovalRequestModel
from app.schemas import DashboardMetrics, SeverityDistribution, EventLogResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardMetrics)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """Computes real-time telemetry from stored database events."""
    events = db.query(EventLogModel).order_by(EventLogModel.timestamp.desc()).all()
    approvals = db.query(ApprovalRequestModel).all()

    scans = [e for e in events if e.event_type == "PROMPT_SCAN"]
    firewall_decisions = [e for e in events if e.event_type == "FIREWALL_DECISION"]

    flagged_inputs = len([s for s in scans if (s.risk_score or 0) >= 25])
    high_and_critical = len([s for s in scans if (s.risk_score or 0) >= 50])

    allowed_actions = len([f for f in firewall_decisions if f.decision == "ALLOW"])
    blocked_actions = len([f for f in firewall_decisions if f.decision == "BLOCK"])
    pending_approvals = len([a for a in approvals if a.status == "PENDING"])

    # Compute actual severity distribution
    sev_counts = {"LOW": 0, "MODERATE": 0, "HIGH": 0, "CRITICAL": 0, "INFO": 0}
    for e in events:
        s = (e.severity or "INFO").upper()
        if s in sev_counts:
            sev_counts[s] += 1
        else:
            sev_counts["INFO"] += 1

    # Recent 10 events
    recent_events = [EventLogResponse(**e.to_dict()) for e in events[:10]]

    # Latest 8 firewall decisions
    latest_decisions = [f.to_dict() for f in firewall_decisions[:8]]

    return DashboardMetrics(
        total_scanned_events=len(scans),
        flagged_inputs=flagged_inputs,
        high_and_critical_findings=high_and_critical,
        allowed_actions=allowed_actions,
        blocked_actions=blocked_actions,
        pending_approval_requests=pending_approvals,
        total_audit_events=len(events),
        severity_distribution=SeverityDistribution(
            low=sev_counts["LOW"],
            moderate=sev_counts["MODERATE"],
            high=sev_counts["HIGH"],
            critical=sev_counts["CRITICAL"],
            info=sev_counts["INFO"],
        ),
        recent_events=recent_events,
        latest_decisions=latest_decisions,
    )
