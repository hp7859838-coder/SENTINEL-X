# SENTINEL-X — AI Agent Security Guardian

[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0.0-009688.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204.0-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Project Vision & Architecture

**SENTINEL-X** is an autonomous cybersecurity guardian designed to defend LLM agents against prompt injection attacks, policy violations, unauthorized tool actions, and data exfiltration.

It decouples **Text Classification** from **Policy Authorization**, guaranteeing that proposed agent actions are independently evaluated against strict server-side rules before any simulated execution can occur.

### Core Workflow

```
INGEST → ANALYZE → CLASSIFY → EVALUATE POLICY → ALLOW / BLOCK / REQUIRE APPROVAL → AUDIT → REPORT
```

### Architecture Diagram

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
                        |   - Independent of Classification    |
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
                        |   - SQLite / PostgreSQL Storage       |
                        |   - Cryptographic Event IDs           |
                        |   - Immutable Audit Records           |
                        +-------------------+-------------------+
                                            |
                                            v
                        +---------------------------------------+
                        |   REPORTING & EXPORT ENGINE (H)       |
                        |   - JSON Consolidated Security Audit  |
                        |   - Live Dashboard Telemetry (A)      |
                        +---------------------------------------+
```

---

## 2. Platform Modules

| Module | Name | Purpose |
| :--- | :--- | :--- |
| **Module A** | **Security Command Center** | Real-time security metrics, severity distribution chart, latest policy decisions, and audit timeline. |
| **Module B** | **Prompt Injection Scanner** | Multiline text scanner detecting instruction overrides, secret extraction, jailbreaks, and obfuscation with 0–100 risk scoring. |
| **Module C** | **Agent Action Firewall** | Server-side policy engine evaluating simulated operations (`ALLOW`, `BLOCK`, `REQUIRE_APPROVAL`). Fails closed on unknown actions. |
| **Module D** | **Approval Workflow** | Human-in-the-loop review queue for privileged mutations. Validates verdicts with mandatory justification reasons. |
| **Module E** | **Threat Simulation Lab** | Predefined 8-scenario suite testing benign controls and attack vectors with instant pass/fail validation. |
| **Module F** | **Detection Rules Manager** | Inspect and toggle static detection rules, adjust score contributions, and view pattern categories. |
| **Module G** | **Event Explorer & Audit** | Unified audit journal with keyword search, multi-factor filtering, and deep JSON payload inspection. |
| **Module H** | **Reporting & Export** | Structured JSON export of consolidated reports, scan records, firewall decisions, and audit history. |
| **Module I** | **Local Security Context** | Transparent role-based security context (`SEC_ADMIN`, `ANALYST`, `AUDITOR`) with no external credential requirements. |
| **Module J** | **API & Hardening** | Security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`), CORS controls, and input validation. |

---

## 3. Technology Stack

- **Backend**: Python 3.12+, FastAPI, SQLAlchemy, Pydantic v2, Pytest, HTTPX, Uvicorn
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts
- **Database**: SQLite (built-in local persistence; cleanly abstracted for PostgreSQL)
- **Deployment**: Multi-stage Dockerfile, Docker Compose

---

## 4. Quick Start & Execution Instructions

### Prerequisites
- Python 3.12+ installed
- Node.js 20+ and npm installed

### Option 1: Unified Single-Port Mode (Recommended for Windows 11)

In this mode, FastAPI serves both the REST API and the pre-compiled React frontend on **http://localhost:8000**.

1. **Set up Python Virtual Environment**:
   ```powershell
   # Windows 11 PowerShell:
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   # (Or run directly with .\.venv\Scripts\python.exe)
   ```

2. **Install Backend Dependencies**:
   ```powershell
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

3. **Build the Frontend Bundle**:
   ```powershell
   cd frontend
   # In Windows PowerShell, use npm.cmd to bypass execution policy restrictions:
   npm.cmd install
   npm.cmd run build
   cd ..
   ```

4. **Launch the Sentinel-X Guardian**:
   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
   ```

5. **Open Browser**:
   Navigate to **[http://localhost:8000](http://localhost:8000)** to interact with the full application.
   Interactive OpenAPI documentation is available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

### Option 2: Split Development Mode (Hot-Reloading)

Run backend and frontend independently in separate terminals:

**Terminal 1 (Backend)**:
```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

**Terminal 2 (Frontend)**:
```powershell
cd frontend
npm.cmd run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser (Vite proxies all `/api` requests to port 8000).

---

### Option 3: Docker Deployment

Run the entire platform inside a lightweight container:
```bash
docker compose up --build
```
Access the application at **[http://localhost:8000](http://localhost:8000)**.

---

## 5. Verification & Automated Test Suite

Sentinel-X includes a comprehensive automated test suite in `backend/tests/test_guardian.py` covering all core cybersecurity controls, fail-closed firewall enforcement, and export serialization.

To execute the test suite:
```powershell
.\.venv\Scripts\python.exe -m pytest backend/tests -v
```

### Verified Test Results (21 of 21 Passed):
```text
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

## 6. Live Competition Demonstration Walkthrough

Follow these steps during a live judge evaluation or demonstration:

### Step 1: Security Command Center
1. Navigate to **Command Center**.
2. Point out that all KPI counters and the severity distribution chart derive directly from live SQLite database events.

### Step 2: Prompt Injection Scanner
1. Open **Prompt Scanner**.
2. Click the preset **"Benign: Meeting Summary"** -> Click **Execute Scan**.
   - Note the **LOW (0/100)** score and lack of flagged rules.
3. Click the preset **"Benign: Academic Security Research"** -> Click **Execute Scan**.
   - Note the low score (~5/100) — demonstrates that discussing cybersecurity concepts is not falsely flagged as an attack.
4. Click the preset **"Adversarial: Instruction Override"** or **"Adversarial: Secret Extraction"** -> Click **Execute Scan**.
   - Observe immediate calculation of a **CRITICAL / HIGH** risk score, matched rule breakdown, and extracted evidence snippets.
   - Point out the project-defined score bands:
     - Low: 0–24
     - Moderate: 25–49
     - High: 50–74
     - Critical: 75–100

### Step 3: Agent Action Firewall
1. Open **Action Firewall**.
2. Select **"Read Public Synthetic Document"** -> Submit -> Outcome is **ALLOW**.
3. Select **"Read Synthetic Restricted Document"** -> Submit -> Outcome is **BLOCK** (under policy `BLOCK_RESTRICTED_ACCESS`).
4. Select **"Transfer Synthetic Data Outbound"** -> Submit -> Outcome is **BLOCK** (data egress prevention).
5. Select **"Unregistered / Malformed Action"** -> Submit -> Outcome is **BLOCK** (demonstrating fail-closed default deny).
6. Select **"Modify Mock Resource State"** -> Submit -> Outcome is **REQUIRE_APPROVAL**.

### Step 4: Human Approval Workflow
1. Navigate to **Approval Queue** (observe the badge indicator incremented).
2. Click **Approve** or **Reject** on the pending request.
3. Enter a mandatory review justification (e.g., *"Authorized by SecOps lead for maintenance window"*).
4. Commit the decision and observe the state transition to `APPROVED` or `REJECTED`.
5. Point out that the frontend cannot bypass this server-validated state.

### Step 5: Threat Simulation Lab
1. Navigate to **Threat Lab**.
2. Click **"Run Full Demo Suite (8 Scenarios)"**.
3. Watch the real-time execution across all 8 vectors, yielding a **100% verified pass rate**.

### Step 6: Export Security Audit
1. Navigate to **Reports & Export**.
2. Inspect the live consolidated JSON telemetry preview.
3. Click **"Export JSON"** to download the immutable security audit file.

---

## 7. API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | Health probe and gateway status |
| `/api/dashboard/stats` | GET | Aggregated live metrics and severity distribution |
| `/api/scan` | POST | Analyze prompt text against active detection heuristics |
| `/api/scan/samples` | GET | Curated benign and adversarial demo payloads |
| `/api/scan/history` | GET | Recent scan audit records |
| `/api/firewall/evaluate` | POST | Enforce server-side security policies on agent operations |
| `/api/firewall/actions` | GET | Catalog of simulated action presets |
| `/api/approvals` | GET | List approval queue requests with optional status filter |
| `/api/approvals/{id}` | GET | Fetch details of a specific approval request |
| `/api/approvals/{id}/decision` | POST | Commit human reviewer decision (APPROVE / REJECT) |
| `/api/simulation/scenarios` | GET | Retrieve 8 predefined threat verification scenarios |
| `/api/simulation/run/{id}` | POST | Run an individual threat verification scenario |
| `/api/simulation/run-all` | POST | Execute batch threat suite and compute pass rate |
| `/api/rules` | GET | List detection rules with category filtering |
| `/api/rules/{id}` | PATCH | Toggle rule status or modify score weight |
| `/api/rules/reset` | POST | Restore detection rules to factory defaults |
| `/api/events` | GET | Search and filter unified security audit journal |
| `/api/events/{id}` | GET | Inspect individual audit record payload |
| `/api/reports/consolidated` | GET | Export full consolidated security audit report (JSON) |
| `/api/reports/scans` | GET | Export prompt injection scan history (JSON) |
| `/api/reports/firewall` | GET | Export firewall decisions and policy events (JSON) |
| `/api/reports/audit` | GET | Export unified audit trail records (JSON) |
| `/api/reports/simulations` | GET | Export threat simulation lab outcomes (JSON) |

---

## 8. IBM Bob & GitHub Handoff Guide

### A. Opening in IBM Bob
1. Launch IBM Bob.
2. Select **File -> Open Folder...** (or **Import Project**).
3. Select the `sentinel-x` root directory.
4. If using Bob's integrated terminal, run:
   ```powershell
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   cd frontend && npm.cmd install && npm.cmd run build && cd ..
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --port 8000
   ```

### B. Pushing to GitHub
1. Verify git working tree:
   ```powershell
   git status
   ```
2. Check configured remote:
   ```powershell
   git remote -v
   ```
3. Stage and commit:
   ```powershell
   git add .
   git commit -m "feat: complete Sentinel-X AI Agent Security Guardian platform"
   ```
4. Push to remote:
   ```powershell
   git push -u origin main
   ```

---

## 9. Troubleshooting Instructions for Windows 11

### 1. PowerShell Script Execution Policy (`npm.ps1 cannot be loaded`)
- **Symptom**: `npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.`
- **Remedy**: Use `npm.cmd` explicitly in Windows PowerShell:
  ```powershell
  npm.cmd install
  npm.cmd run build
  ```
  Alternatively, update your user execution policy once:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### 2. Port 8000 Already in Use
- **Symptom**: `[Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)`
- **Remedy**: Check the listening process and terminate it, or select an alternative port:
  ```powershell
  Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
  # Or start on port 8080:
  .\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --port 8080
  ```

### 3. Missing Frontend Assets / 404 on Root
- **Symptom**: Accessing `http://localhost:8000` returns `{"detail":"Not Found"}`.
- **Remedy**: The frontend bundle must be built once into `frontend/dist`:
  ```powershell
  cd frontend
  npm.cmd run build
  cd ..
  ```

### 4. Database Concurrency or Lock Notice
- **Symptom**: SQLite database locked warning during intense tests.
- **Remedy**: `backend/app/database.py` enables `check_same_thread=False` and cleanly manages sessions via FastAPI dependencies. For enterprise multi-writer deployments, configure `DATABASE_URL=postgresql://...`.

---

## 10. Security Limitations & Production Enhancements

- **Heuristic Scope**: Static regex and token heuristics catch known override patterns, delimiter injections, and exfiltration directives. However, novel zero-day prompt embeddings or multi-turn conversational injections can evade static filters.
- **Defense in Depth**: In enterprise production, Sentinel-X should be paired with an LLM-as-a-judge layer, semantic vector guardrails, and cryptographic token tagging.
- **Simulated Boundaries**: Only actions routed through the Sentinel-X policy gateway are enforced. Direct out-of-band OS execution by an agent outside the gateway is outside this platform's purview.
- **PDF Export**: Structured JSON export is fully implemented; server-side PDF generation via WeasyPrint or headless browser rendering is planned for future enterprise releases.
- **Multi-Factor Approver Auth**: Currently operates in transparent Local Security Mode (`SEC_ADMIN`, `ANALYST`, `AUDITOR`). Enterprise production roadmap includes OIDC / SAML integration.
