"""
Reporting and JSON export generator for SENTINEL-X.
Serializes database-backed audit records, firewall decisions, scanner logs,
and consolidated security summaries into structured JSON exports.
"""
from datetime import datetime, timezone
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import EventLogModel, ApprovalRequestModel, DetectionRuleModel
from app.schemas import ConsolidatedReport, DashboardMetrics, SeverityDistribution, EventLogResponse, DetectionRuleResponse


def generate_consolidated_report(db: Session) -> Dict[str, Any]:
    """Builds a comprehensive JSON report containing all live system telemetry."""
    now_utc = datetime.now(timezone.utc).isoformat()

    # Query real telemetry from DB
    events = db.query(EventLogModel).order_by(EventLogModel.timestamp.desc()).all()
    approvals = db.query(ApprovalRequestModel).order_by(ApprovalRequestModel.timestamp.desc()).all()
    rules = db.query(DetectionRuleModel).all()

    # Calculate real statistics
    total_audit_events = len(events)
    scans = [e for e in events if e.event_type == "PROMPT_SCAN"]
    firewall_decisions = [e for e in events if e.event_type == "FIREWALL_DECISION"]
    allowed_actions = len([e for e in firewall_decisions if e.decision == "ALLOW"])
    blocked_actions = len([e for e in firewall_decisions if e.decision == "BLOCK"])
    pending_approvals = len([a for a in approvals if a.status == "PENDING"])

    flagged_inputs = len([s for s in scans if (s.risk_score or 0) >= 25])
    high_crit_findings = len([s for s in scans if (s.risk_score or 0) >= 50])

    # Severity distribution
    sev_counts = {"LOW": 0, "MODERATE": 0, "HIGH": 0, "CRITICAL": 0, "INFO": 0}
    for e in events:
        s = (e.severity or "INFO").upper()
        if s in sev_counts:
            sev_counts[s] += 1
        else:
            sev_counts["INFO"] += 1

    simulations = [e for e in events if e.event_type == "SIMULATION_RUN"]

    report_payload = {
        "report_id": f"REP-SENTINELX-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
        "generated_at": now_utc,
        "platform": "SENTINEL-X AI Agent Security Guardian",
        "system_version": "1.0.0",
        "disclaimer": (
            "This report is generated from the local Sentinel-X simulated security gateway. "
            "Rule-based detection is heuristic and probabilistic. Simulated actions do not execute on the OS."
        ),
        "metrics_summary": {
            "total_audit_events": total_audit_events,
            "total_scanned_events": len(scans),
            "flagged_inputs": flagged_inputs,
            "high_and_critical_findings": high_crit_findings,
            "allowed_actions": allowed_actions,
            "blocked_actions": blocked_actions,
            "pending_approval_requests": pending_approvals,
            "severity_distribution": sev_counts,
        },
        "recent_audit_events": [e.to_dict() for e in events[:50]],
        "approval_requests": [a.to_dict() for a in approvals],
        "active_detection_rules": [r.to_dict() for r in rules if r.is_enabled],
        "threat_simulations": [s.to_dict() for s in simulations[:20]],
    }

    return report_payload


def export_scans_json(db: Session) -> Dict[str, Any]:
    events = db.query(EventLogModel).filter(EventLogModel.event_type == "PROMPT_SCAN").order_by(EventLogModel.timestamp.desc()).all()
    return {
        "export_type": "PROMPT_SCAN_RECORDS",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "total_records": len(events),
        "records": [e.to_dict() for e in events],
    }


def export_firewall_json(db: Session) -> Dict[str, Any]:
    events = db.query(EventLogModel).filter(EventLogModel.event_type == "FIREWALL_DECISION").order_by(EventLogModel.timestamp.desc()).all()
    return {
        "export_type": "FIREWALL_DECISIONS",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "total_records": len(events),
        "records": [e.to_dict() for e in events],
    }


def export_audit_trail_json(db: Session) -> Dict[str, Any]:
    events = db.query(EventLogModel).order_by(EventLogModel.timestamp.desc()).all()
    return {
        "export_type": "UNIFIED_AUDIT_TRAIL",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "total_records": len(events),
        "records": [e.to_dict() for e in events],
    }


def export_simulations_json(db: Session) -> Dict[str, Any]:
    events = db.query(EventLogModel).filter(EventLogModel.event_type == "SIMULATION_RUN").order_by(EventLogModel.timestamp.desc()).all()
    return {
        "export_type": "THREAT_SIMULATION_RESULTS",
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "total_records": len(events),
        "records": [e.to_dict() for e in events],
    }
