# IBM SkillsBuild Cybersecurity & AI Capstone Submission Package
## Project: SENTINEL-X — AI Agent Security Guardian

---

### 1. Executive Summary

**Project Title**: SENTINEL-X — AI Agent Security Guardian  
**Domain**: Defensive Cybersecurity, Artificial Intelligence & Application Security  
**Student / Project Lead**: Hari Prasanth  
**Target Platform**: Local Security Gateway (Cross-platform: Windows 11, Linux, macOS)  
**Live Access URL**: `http://localhost:8000` (FastAPI + Embedded React 19 Frontend)  
**Status**: Fully Verified, Tested & Ready for Evaluation  

**SENTINEL-X** is an autonomous defensive cybersecurity platform designed to protect Large Language Model (LLM) agents and multi-agent systems against prompt injection, jailbreaking, unauthorized tool execution, and simulated data exfiltration. 

By fundamentally decoupling **untrusted text classification** from **policy-enforced action authorization**, Sentinel-X guarantees that no agent-proposed operation is executed without independent backend validation, human supervisory approval gates where required, and immutable audit logging.

---

### 2. Problem Statement

Autonomous AI agents are increasingly entrusted with access to tools, databases, APIs, and business systems. However, modern LLMs are vulnerable to:
1. **Direct & Indirect Prompt Injections**: Adversarial inputs that command the agent to ignore its system prompt and execute unauthorized tasks.
2. **Confidential Token & Secret Extraction**: Prompts tailored to trick agents into leaking proprietary prompts, synthetic keys, or credential tokens.
3. **Safety Guardrail Circumvention**: Jailbreak templates designed to bypass compliance and safety rules.
4. **Autonomous Tool Abuse & Data Exfiltration**: Malicious directives coercing the agent to make unapproved outbound network requests or mutate critical infrastructure.

Current security approaches typically rely on either client-side regexes or post-generation text filtering, which can be easily evaded and fail to protect downstream autonomous actions.

---

### 3. Proposed Solution

**SENTINEL-X** introduces a multi-tier defensive architecture that intercepts both incoming untrusted inputs and outgoing autonomous agent actions:

1. **Prompt Injection Scanner (Input Tier)**: Evaluates multiline text, Markdown, and JSON payloads against transparent, explainable heuristic patterns. Calculates clamped risk scores (0–100) and maps them into standardized risk bands (LOW, MODERATE, HIGH, CRITICAL).
2. **Agent Action Firewall (Policy Tier)**: A backend policy gateway enforcing server-side policy rules. Evaluates every proposed operation independently of client input. Evaluates actions into three strict decisions:
   - `ALLOW`: Permitted operations (e.g., reading verified public synthetic documentation).
   - `BLOCK`: Unpermitted or dangerous operations (e.g., reading restricted documents, unauthorized data egress, or path traversal). Fails closed by default on unrecognized or malformed actions (`DEFAULT_DENY_FAIL_CLOSED`).
   - `REQUIRE_APPROVAL`: High-impact state mutations (e.g., mock resource configuration, privilege escalation) that are dispatched to a human supervisory queue.
3. **Human Approval Workflow (Supervisory Tier)**: A reviewer interface where security operators inspect pending requests, evaluate risks, and submit binding APPROVE or REJECT verdicts with mandatory audit justification.
4. **Threat Simulation Lab (Verification Tier)**: A repeatable automated suite containing 8 attack and benign scenarios to scientifically validate the security posture.
5. **Centralized Immutable Audit Trail (Compliance Tier)**: A database-backed event journal recording scans, firewall verdicts, approvals, and configuration changes with timestamps and cryptographic IDs.
6. **Reporting & Telemetry Export (Audit Tier)**: Complete structured JSON exports for consolidated security assessments, scan logs, firewall decisions, threat simulations, and audit trails.

---

### 4. Target Users & Stakeholders

- **AI Security Engineers & DevSecOps Teams**: Looking to establish policy guardrails and firewall gates around production AI agents.
- **Enterprise Compliance Auditors**: Requiring transparent, immutable audit trails of all autonomous agent actions and human approvals.
- **Cybersecurity Students & Researchers**: Demonstrating explainable, reproducible prompt injection heuristics and defense-in-depth principles.

---

### 5. Architecture & Technology Stack

```
                        +------------------------------------------+
                        |              UNTRUSTED INPUT             |
                        | (User message, prompt, multi-agent tool) |
                        +--------------------+---------------------+
                                             |
                                             v
                         +---------------------------------------+
                         |     PROMPT INJECTION SCANNER (B)      |
                         |   - Explainable Heuristics & RegEx    |
                         |   - Risk Bands (0-100: Low/Mod/Hi/Crit)|
                         |   - Evidence Snippet Extraction       |
                         +-------------------+-------------------+
                                             |
                                             v
                         +---------------------------------------+
                         |      AGENT ACTION FIREWALL (C)        |
                         |   - Server-Side Policy Engine         |
                         |   - Fail-Closed Default Deny          |
                         |   - Path Traversal & OS Isolation     |
                         +---+---------------+---------------+---+
                             |               |               |
                     [ALLOW] |       [BLOCK] |               | [REQUIRE_APPROVAL]
                             v               v               v
                 +---------------+   +---------------+   +-----------------------+
                 | Execute Safe  |   | Quarantine &  |   | APPROVAL WORKFLOW (D) |
                 | Simulated Read|   | Reject Action |   | - Human-in-the-Loop   |
                 +-------+-------+   +-------+-------+   | - Justification Audit |
                         |                   |           +-----------+-----------+
                         +-------------------+-----------------------+
                                             |
                                             v
                         +---------------------------------------+
                         |      CENTRAL AUDIT JOURNAL (G)        |
                         |   - SQLite / PostgreSQL Persistence   |
                         |   - Unique Event & Request IDs        |
                         |   - Immutable Audit Records           |
                         +-------------------+-------------------+
                                             |
                                             v
                         +---------------------------------------+
                         |   REPORTING & EXPORT ENGINE (H)       |
                         |   - 5 Structured JSON Exports         |
                         |   - Live Dashboard Telemetry (A)      |
                         +---------------------------------------+
```

### Technology Matrix:
| Component | Technologies |
| :--- | :--- |
| **Backend Core** | Python 3.12+ / 3.14, FastAPI, Starlette |
| **Data Validation** | Pydantic v2 |
| **ORM & Persistence** | SQLAlchemy 2.0, SQLite (fully abstracted for PostgreSQL) |
| **Frontend Framework** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **Visualization** | Recharts, Lucide React Icons |
| **Testing** | Pytest, HTTPX, FastAPI TestClient |
| **Server Engine** | Uvicorn (ASGI) |

---

### 6. Verified Test Results (21 / 21 Passed)

Sentinel-X was verified using automated integration and unit tests covering all security modules:

```text
============================= test session starts =============================
platform win32 -- Python 3.14.3, pytest-9.1.1, pluggy-1.7.0
rootdir: C:\Users\Hari prasanth\OneDrive\Desktop\sentinel-x
configfile: pytest.ini
collected 21 items

backend/tests/test_guardian.py::test_health_check PASSED                 [  4%]
backend/tests/test_guardian.py::test_scan_benign_text PASSED             [  9%]
backend/tests/test_guardian.py::test_scan_instruction_override PASSED    [ 14%]
backend/tests/test_guardian.py::test_scan_secret_extraction PASSED       [ 19%]
backend/tests/test_guardian.py::test_scan_multiple_indicators_clamped PASSED [ 23%]
backend/tests/test_guardian.py::test_scan_benign_security_research PASSED [ 28%]
backend/tests/test_guardian.py::test_scan_empty_content_rejected PASSED  [ 33%]
backend/tests/test_guardian.py::test_disabled_rule_not_evaluated PASSED  [ 38%]
backend/tests/test_guardian.py::test_firewall_public_read_allowed PASSED [ 42%]
backend/tests/test_guardian.py::test_firewall_restricted_document_blocked PASSED [ 47%]
backend/tests/test_guardian.py::test_firewall_data_transfer_blocked PASSED [ 52%]
backend/tests/test_guardian.py::test_firewall_modify_resource_requires_approval PASSED [ 57%]
backend/tests/test_guardian.py::test_firewall_unknown_action_fails_closed PASSED [ 61%]
backend/tests/test_guardian.py::test_approval_workflow_lifecycle PASSED  [ 66%]
backend/tests/test_guardian.py::test_simulation_scenarios_listing PASSED [ 71%]
backend/tests/test_guardian.py::test_batch_simulation_execution PASSED   [ 76%]
backend/tests/test_guardian.py::test_audit_trail_and_dashboard_counts PASSED [ 80%]
backend/tests/test_guardian.py::test_json_reporting_exports PASSED       [ 85%]
backend/tests/test_guardian.py::test_firewall_path_traversal_blocked PASSED [ 90%]
backend/tests/test_guardian.py::test_firewall_empty_resource_fails_closed PASSED [ 95%]
backend/tests/test_guardian.py::test_scan_markdown_formatting_detected PASSED [100%]

======================== 21 passed in 3.32s ========================
```

---

### 7. Step-by-Step Live Demonstration Walkthrough

During an evaluation or judge review, perform this 6-step walkthrough:

1. **Security Command Center (`/`)**:
   - Inspect live KPI metrics (Scanned Inputs, Flagged Inputs, High & Critical, Pending Approvals, Allowed Actions, Blocked Actions, Total Audit Events).
   - Review the Severity Distribution chart and latest firewall decisions table.
2. **Prompt Injection Scanner**:
   - Test Benign Query: Select *"Benign: Meeting Summary"* -> Execute Scan -> **LOW Risk (0/100)**.
   - Test Benign Security Research: Select *"Benign: Academic Security Research"* -> Execute Scan -> **LOW Risk (5/100)** (verifies terminology does not trigger false positives).
   - Test Adversarial Injection: Select *"Adversarial: Instruction Override"* -> Execute Scan -> **CRITICAL Risk (75/100)** with matched evidence snippet and rule breakdown.
3. **Agent Action Firewall**:
   - Select *"Read Public Synthetic Document"* -> Submit -> Verdict: **ALLOW**.
   - Select *"Read Synthetic Restricted Document"* -> Submit -> Verdict: **BLOCK** (`BLOCK_RESTRICTED_ACCESS`).
   - Select *"Unregistered / Malformed Action"* -> Submit -> Verdict: **BLOCK** (`DEFAULT_DENY_FAIL_CLOSED`).
   - Select *"Modify Mock Resource State"* -> Submit -> Verdict: **REQUIRE_APPROVAL**.
4. **Approval Queue**:
   - View the pending request badge indicator.
   - Click **Approve** or **Reject** on the pending action.
   - Enter mandatory justification: *"Authorized by security lead for scheduled test maintenance."*
   - Commit decision -> State transitions to `APPROVED` / `REJECTED` and creates an immutable audit record.
5. **Threat Simulation Lab**:
   - Click **"Run Full Demo Suite (8 Scenarios)"**.
   - Observe 100% verified pass rate across all 8 scenarios with exact expected vs. actual behavior.
6. **Reporting & Telemetry Export**:
   - Navigate to **Reports & Export**.
   - Inspect the live JSON preview.
   - Export structured JSON reports for Consolidated Report, Scans, Firewall Decisions, Threat Simulations, and Full Audit Trail.

---

### 8. Known Limitations & Production Roadmap

- **Heuristic Boundaries**: Transparent regex heuristics detect known adversarial patterns and jailbreaks. In an enterprise production setting, this should be complemented by an LLM-as-a-judge layer and semantic embeddings.
- **Simulation Sandbox**: Actions are strictly simulated to protect the host OS. Sentinel-X does not run shell commands or make unrestricted network calls.
- **PDF Generation**: Native JSON exports are fully operational; server-side PDF generation is scheduled for future enterprise releases.
- **Identity & Access**: Operates in Local Security Mode (`SEC_ADMIN`, `ANALYST`, `AUDITOR`) for zero-credential setup. Enterprise roadmap includes OAuth2 / OIDC integration.

---

### 9. Installation Instructions for Windows 11

```powershell
# 1. Clone repository
git clone <repository-url>
cd sentinel-x

# 2. Setup Virtual Environment
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

# 3. Build Frontend Bundle (using npm.cmd for PowerShell compatibility)
cd frontend
npm.cmd install
npm.cmd run build
cd ..

# 4. Launch Sentinel-X Guardian
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000

# 5. Access in Browser
# Web Application: http://localhost:8000
# OpenAPI / Swagger Docs: http://localhost:8000/docs
```
