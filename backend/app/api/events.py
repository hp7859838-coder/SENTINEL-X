"""
Event Explorer and Audit Trail API endpoints.
Provides filtering, searching, and deep inspection of all security events.
"""
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import EventLogModel
from app.schemas import EventLogResponse

router = APIRouter(prefix="/api/events", tags=["Event Explorer & Audit"])


@router.get("", response_model=Dict[str, Any])
def search_events(
    query: Optional[str] = Query(None, description="Search term in summary or reason"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    decision: Optional[str] = Query(None, description="Filter by decision"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Searches and filters the centralized immutable security audit trail.
    Results are returned newest first.
    """
    db_query = db.query(EventLogModel)

    if query:
        search_pattern = f"%{query}%"
        db_query = db_query.filter(
            or_(
                EventLogModel.summary.ilike(search_pattern),
                EventLogModel.reason.ilike(search_pattern),
                EventLogModel.related_id.ilike(search_pattern),
                EventLogModel.id.ilike(search_pattern),
            )
        )

    if event_type:
        db_query = db_query.filter(EventLogModel.event_type == event_type.upper())

    if severity:
        db_query = db_query.filter(EventLogModel.severity == severity.upper())

    if decision:
        db_query = db_query.filter(EventLogModel.decision == decision.upper())

    total_count = db_query.count()
    events = (
        db_query.order_by(EventLogModel.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "events": [EventLogResponse(**e.to_dict()) for e in events],
    }


@router.get("/{event_id}", response_model=EventLogResponse)
def get_event_detail(event_id: str, db: Session = Depends(get_db)):
    """Retrieves full details of a specific security audit record."""
    event = db.query(EventLogModel).filter(EventLogModel.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Audit event '{event_id}' not found.")
    return EventLogResponse(**event.to_dict())
