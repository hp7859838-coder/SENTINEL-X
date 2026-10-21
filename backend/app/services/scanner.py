"""
Transparent rule-based prompt injection detection engine for SENTINEL-X.
Evaluates input against configurable, explainable security rules and generates
clamped risk scores with evidence snippets.
"""
import re
import uuid
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from app.models import DetectionRuleModel, EventLogModel
from app.schemas import ScanResult, MatchedRuleDetail


DEFAULT_RULES = [
    {
        "id": "RULE-OVR-01",
        "name": "Instruction Override Attempt",
        "description": "Detects attempts to command the agent to ignore, disregard, or overwrite prior system instructions.",
        "category": "INSTRUCTION_OVERRIDE",
        "severity": "HIGH",
        "score_weight": 40,
        "pattern": r"(?i)\b(ignore|disregard|forget|override|bypass)\s+(all\s+)?(previous|prior|above|system)\s+(instructions|directives|prompts|rules|guidelines)",
        "is_enabled": True,
    },
    {
        "id": "RULE-OVR-02",
        "name": "Priority / Role Hijack",
        "description": "Detects commands attempting to forcibly redefine the agent's core identity or role.",
        "category": "INSTRUCTION_OVERRIDE",
        "severity": "HIGH",
        "score_weight": 35,
        "pattern": r"(?i)\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(an?\s+unrestricted|a\s+rogue|a\s+hacked|DAN|jailbroken|an?\s+evil)\b",
        "is_enabled": True,
    },
    {
        "id": "RULE-SEC-01",
        "name": "System Secret / Prompt Leakage",
        "description": "Detects requests targeting internal system instructions, confidential tokens, or synthetic secrets.",
        "category": "SECRET_EXTRACTION",
        "severity": "CRITICAL",
        "score_weight": 50,
        "pattern": r"(?i)\b(reveal|display|output|print|dump|leak|show)\s+(the\s+)?(system\s+prompt|internal\s+instructions|secret\s+key|api\s+key|confidential\s+token|synthetic\s+secret)",
        "is_enabled": True,
    },
    {
        "id": "RULE-BYP-01",
        "name": "Policy & Safety Filter Bypass",
        "description": "Detects direct attempts to disable ethical boundaries, safety filters, or compliance controls.",
        "category": "POLICY_BYPASS",
        "severity": "CRITICAL",
        "score_weight": 50,
        "pattern": r"(?i)\b(bypass|disable|turn\s+off|circumvent)\s+(the\s+)?(safety\s+(filters|protocols|rules)|content\s+filter|guardrails?|policy\s+engine)",
        "is_enabled": True,
    },
    {
        "id": "RULE-IMP-01",
        "name": "Fake System / Admin Delimiter Impersonation",
        "description": "Detects faux system-level formatting designed to trick the LLM into thinking a message originated from system admin.",
        "category": "IMPERSONATION",
        "severity": "HIGH",
        "score_weight": 30,
        "pattern": r"(?i)(\[system\s*(alert|override|message|directive)\]|\[admin(istrator)?\s*directive\]|###\s*system\s*instruction|---BEGIN\s+SYSTEM\s+OVERRIDE---)",
        "is_enabled": True,
    },
    {
        "id": "RULE-EXF-01",
        "name": "Unauthorized Action / Exfiltration Directive",
        "description": "Detects directives coercing the agent to exfiltrate data, invoke unauthorized webhooks, or alter access logs.",
        "category": "DATA_EXFILTRATION",
        "severity": "CRITICAL",
        "score_weight": 40,
        "pattern": r"(?i)\b(exfiltrate|send\s+(data|records|file)\s+to|curl\s+https?://|wget\s+https?://|delete\s+logs|drop\s+database|elevate\s+privileges|send\s+payload\s+to\s+webhook)",
        "is_enabled": True,
    },
    {
        "id": "RULE-ENC-01",
        "name": "Obfuscation & Suspicious Encoding",
        "description": "Detects embedded encoded payloads (base64/hex markers) or explicit obfuscation cues.",
        "category": "DELIMITER_INJECTION",
        "severity": "MODERATE",
        "score_weight": 25,
        "pattern": r"(?i)(base64\s*(decode|string|payload)\s*[:=]|execute\s*hex\s*encoded|rot13\s*decode)",
        "is_enabled": True,
    },
    {
        "id": "RULE-BEN-01",
        "name": "Security Vocabulary Heuristic",
        "description": "Evaluates discussion of security concepts to differentiate benign research from active injection attempts.",
        "category": "BENIGN_ANALYSIS",
        "severity": "LOW",
        "score_weight": 5,
        "pattern": r"(?i)\b(cybersecurity|firewall|vulnerability\s+assessment|defensive\s+architecture|threat\s+modeling)\b",
        "is_enabled": True,
    },
]


def init_default_rules(db: Session) -> None:
    """Populates default rules into DB if the table is empty."""
    existing_count = db.query(DetectionRuleModel).count()
    if existing_count == 0:
        for r_data in DEFAULT_RULES:
            rule = DetectionRuleModel(
                id=r_data["id"],
                name=r_data["name"],
                description=r_data["description"],
                category=r_data["category"],
                severity=r_data["severity"],
                score_weight=r_data["score_weight"],
                pattern=r_data["pattern"],
                is_enabled=r_data["is_enabled"],
            )
            db.add(rule)
        db.commit()


def get_risk_label(score: int) -> str:
    """Project-defined score bands: Low: 0-24, Moderate: 25-49, High: 50-74, Critical: 75-100"""
    if score >= 75:
        return "CRITICAL"
    elif score >= 50:
        return "HIGH"
    elif score >= 25:
        return "MODERATE"
    return "LOW"


def scan_prompt_content(content: str, db: Session, input_type: str = "text") -> ScanResult:
    """
    Executes prompt scanning against active database rules.
    Extracts matched snippets, prevents duplicate score accumulation,
    and returns an explainable ScanResult.
    """
    # Fetch only active rules from DB
    rules = db.query(DetectionRuleModel).filter(DetectionRuleModel.is_enabled == True).all()

    matched_details: List[MatchedRuleDetail] = []
    accumulated_score = 0

    # Ensure rule evaluation never runs arbitrary code
    for rule in rules:
        try:
            regex = re.compile(rule.pattern)
            match = regex.search(content)
            if match:
                # Capture matched substring as evidence (max 120 chars for display)
                snippet = match.group(0)
                start, end = match.span()
                context_start = max(0, start - 20)
                context_end = min(len(content), end + 20)
                evidence = f"...{content[context_start:context_end].strip()}..."

                explanation = (
                    f"Matched {rule.category} indicator via pattern '{rule.name}'. "
                    f"Contributes +{rule.score_weight} to risk score."
                )

                matched_details.append(
                    MatchedRuleDetail(
                        rule_id=rule.id,
                        rule_name=rule.name,
                        category=rule.category,
                        severity=rule.severity,
                        weight=rule.score_weight,
                        evidence=evidence,
                        explanation=explanation,
                    )
                )
                accumulated_score += rule.score_weight
        except Exception:
            # Continue gracefully if a custom pattern fails compilation
            continue

    # Clamp score to project band [0, 100]
    final_score = min(100, max(0, accumulated_score))
    risk_label = get_risk_label(final_score)

    scan_id = f"SCAN-{uuid.uuid4().hex[:8].upper()}"
    timestamp_str = datetime.now(timezone.utc).isoformat()

    # Generate transparent explanation
    if not matched_details:
        explanation = (
            "No known prompt injection patterns were detected in the supplied text. "
            "Assigned LOW risk (0/100). Note that novel or semantic evasions may still bypass static heuristics."
        )
    else:
        categories = list({m.category for m in matched_details})
        explanation = (
            f"Detected {len(matched_details)} security indicator(s) across categories: {', '.join(categories)}. "
            f"Calculated aggregate risk score: {final_score}/100 ({risk_label})."
        )

    # Prepare preview (safe truncated text)
    safe_preview = content[:200] + ("..." if len(content) > 200 else "")

    return ScanResult(
        scan_id=scan_id,
        timestamp=timestamp_str,
        risk_score=final_score,
        risk_label=risk_label,
        matched_rules=matched_details,
        explanation=explanation,
        input_preview=safe_preview,
        input_type=input_type,
        character_count=len(content),
    )
