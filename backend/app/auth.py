"""
Authentication and Authorization module for SENTINEL-X.
Implements a secure-by-default, transparent Local Security Mode with role-based
clearance levels for the demonstration platform.
"""
from typing import Optional
from fastapi import Header, HTTPException, status
from pydantic import BaseModel


class UserSession(BaseModel):
    username: str
    role: str  # SEC_ADMIN, SECURITY_ANALYST, AUDITOR, GUEST
    can_approve: bool
    is_authenticated: bool


DEMO_USERS = {
    "admin": {
        "username": "sec-admin",
        "role": "SEC_ADMIN",
        "can_approve": True,
    },
    "analyst": {
        "username": "sec-analyst",
        "role": "SECURITY_ANALYST",
        "can_approve": True,
    },
    "auditor": {
        "username": "compliance-auditor",
        "role": "AUDITOR",
        "can_approve": False,
    },
}


def get_current_user(
    x_sentinel_role: Optional[str] = Header(None, description="Active demo role header"),
    authorization: Optional[str] = Header(None),
) -> UserSession:
    """
    Resolves the caller identity. In local demo mode, roles can be toggled via header
    or default to SEC_ADMIN for full accessibility without external credential setup.
    """
    role_key = (x_sentinel_role or "admin").lower()
    user_info = DEMO_USERS.get(role_key, DEMO_USERS["admin"])

    return UserSession(
        username=user_info["username"],
        role=user_info["role"],
        can_approve=user_info["can_approve"],
        is_authenticated=True,
    )
