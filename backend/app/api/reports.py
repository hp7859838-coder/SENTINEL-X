"""
Reporting and Export API endpoints.
Provides structured JSON downloads for scans, firewall decisions, audit trail, and consolidated reports.
"""
from fastapi import APIRouter, Depends, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.reporter import (
    generate_consolidated_report,
    export_scans_json,
    export_firewall_json,
    export_audit_trail_json,
)
from datetime import datetime, timezone
import json

router = APIRouter(prefix="/api/reports", tags=["Reporting & Export"])


@router.get("/consolidated")
def get_consolidated_report(download: bool = False, db: Session = Depends(get_db)):
    """Generates complete consolidated security report in JSON format."""
    data = generate_consolidated_report(db)
    if download:
        filename = f"sentinel_x_consolidated_report_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    return data


@router.get("/scans")
def get_scans_export(download: bool = False, db: Session = Depends(get_db)):
    """Exports all prompt injection scan history in JSON format."""
    data = export_scans_json(db)
    if download:
        filename = f"sentinel_x_scans_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    return data


@router.get("/firewall")
def get_firewall_export(download: bool = False, db: Session = Depends(get_db)):
    """Exports all agent action firewall decisions in JSON format."""
    data = export_firewall_json(db)
    if download:
        filename = f"sentinel_x_firewall_decisions_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    return data


@router.get("/audit")
def get_audit_export(download: bool = False, db: Session = Depends(get_db)):
    """Exports complete unified audit trail in JSON format."""
    data = export_audit_trail_json(db)
    if download:
        filename = f"sentinel_x_audit_trail_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    return data
