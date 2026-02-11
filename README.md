<div align="center">

# 🚨 SIREN

### Security Incident Response Engine & Notation

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![NIST](https://img.shields.io/badge/Framework-NIST%20800--61-0071C5?style=flat-square)](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final)

A professional incident response documentation tool built for SOC analysts and incident responders. Generate structured, exportable incident reports following the **NIST 800-61** Computer Security Incident Handling Guide framework.

[Features](#features) · [Quick Start](#quick-start) · [Usage](#usage) · [Project Structure](#project-structure) · [Example Report](#example-report)

</div>

---

## Overview

SIREN streamlines the incident documentation process by providing a clean, dark-themed web interface purpose-built for Security Operations Center environments. Instead of wrestling with Word templates or scattered notes during a live incident, analysts can rapidly capture timeline events, IOCs, affected systems, and recommendations in a structured format — then export everything to Markdown or JSON with one click.

The tool follows the NIST 800-61 incident handling lifecycle (Detection → Containment → Eradication → Recovery) and includes a severity scoring algorithm that factors in the number of IOCs, affected systems, and base severity to produce a composite risk score.

---

## Features

**Incident Documentation**
- Complete metadata tracking with auto-generated incident IDs (`IR-YYYYMMDD-XXXX`)
- Severity levels: Low, Medium, High, Critical — with composite severity scoring (0–10 scale)
- Nine incident categories aligned with common SOC taxonomy
- NIST 800-61 lifecycle date tracking (detection, containment, eradication, recovery)

**Dynamic Data Collection**
- Chronologically sorted timeline events with source attribution
- IOC management supporting IP addresses, domains, URLs, file hashes, emails, and usernames
- Affected systems documentation with hostname, IP, and impact details
- Recommendations section for remediation actions and follow-ups
- Real-time item preview as you add entries
- Keyboard shortcuts (`Ctrl/Cmd + Enter`) for rapid data entry

**Export & Output**
- Professional Markdown reports with tables, severity badges, and structured sections
- JSON export for automation, SIEM integration, or API consumption
- Copy-to-clipboard functionality
- Direct file download (.md and .json)

**SOC-Friendly Design**
- Dark theme optimized for 24/7 operations environments
- Responsive design for various screen sizes
- Clean, professional interface suitable for analyst workstations
- Sample incident report (Qakbot malware) for testing and demonstration

---

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/Rootless-Ghost/SIREN.git
cd SIREN

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

Open your browser and navigate to **http://127.0.0.1:5000**

---

## Usage

### 1. Fill in Incident Metadata

Enter the incident title, select severity and category, provide the analyst name, and set the relevant dates for each phase of the incident lifecycle.

### 2. Build the Timeline

Add chronological events as the incident unfolds. Each event captures a timestamp, description, and source (e.g., SIEM, EDR, Firewall). Events are automatically sorted by time.

### 3. Document IOCs

Record Indicators of Compromise with their type, value, and context. Supported types include IP addresses, domains, URLs, file hashes (MD5/SHA256), email addresses, and usernames.

### 4. Log Affected Systems

Document each impacted system with its hostname, IP address, and a description of the impact.

### 5. Add Recommendations

Capture remediation actions, follow-up tasks, and preventive measures.

### 6. Generate & Export

Click **Generate Incident Report** to produce the final output. Switch between Markdown and JSON views, then copy to clipboard or download the file.

### Loading the Sample Report

Click the **Load Sample** button in the header to populate the form with a complete Qakbot malware incident. This is useful for testing or as a reference for how to fill out a thorough report.

---

## Project Structure

```
SIREN/
├── app.py                          # Flask application entry point
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── SECURITY.md                     # Security considerations
├── QUICKSTART.md                   # GitHub Desktop setup guide
├── LICENSE                         # MIT License
├── .gitignore                      # Git ignore rules
├── src/
│   ├── __init__.py                 # Package init
│   ├── report_engine.py            # Core data models & severity scoring
│   └── report_exporter.py          # Markdown & JSON export logic
├── templates/
│   └── index.html                  # Main web interface
├── static/
│   ├── css/
│   │   └── style.css               # Dark SOC theme
│   └── js/
│       └── app.js                  # Frontend logic & dynamic forms
└── samples/
    └── sample_qakbot_incident.json # Complete sample incident report
```

---

## Example Report

Below is a truncated example of the Markdown output from the included Qakbot sample:

```markdown
# 🚨 Incident Report: Qakbot Malware Infection via Phishing Email

**Incident ID:** `IR-20250210-A3F7`
**Generated:** 2025-02-10 17:00:00 UTC

---

## 📋 Incident Metadata

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Malware Incident |
| **Analyst** | J. Ramirez |
| **Severity Score** | 7.5/10 (HIGH) |

## 🕐 Incident Timeline

| # | Timestamp | Event | Source |
|---|-----------|-------|--------|
| 1 | `2025-02-10 08:32:00 UTC` | Phishing email received... | Email Gateway |
| 2 | `2025-02-10 08:47:00 UTC` | User opened malicious attachment... | EDR |
...

## 🔍 Indicators of Compromise (IOCs)

| # | Type | Value | Context |
|---|------|-------|---------|
| 1 | IP Address | `185.234.72.19` | Qakbot C2 server |
| 2 | Domain | `update-service.xyz` | Payload delivery domain |
...
```

View the full sample in [`samples/sample_qakbot_incident.json`](samples/sample_qakbot_incident.json).

---

## API Endpoints

SIREN exposes a simple REST API for programmatic access:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serve the web interface |
| `POST` | `/api/generate` | Generate a report from JSON payload |
| `GET` | `/api/sample` | Retrieve the sample Qakbot incident |

### Example API Usage

```bash
curl -X POST http://127.0.0.1:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Suspicious Login Activity",
    "severity": "Medium",
    "category": "Unauthorized Access",
    "analyst": "Your Name",
    "iocs": [{"type": "IP Address", "value": "203.0.113.50", "context": "Brute force source"}],
    "recommendations": ["Block source IP at firewall", "Enforce MFA on affected accounts"]
  }'
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python 3, Flask |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Styling | Custom dark theme (CSS variables) |
| Fonts | JetBrains Mono, IBM Plex Sans |
| Framework | NIST SP 800-61 Rev. 2 |

---

## Security

See [SECURITY.md](SECURITY.md) for important security considerations when handling incident data.

**Key points:**
- Run SIREN on localhost only — do not expose to the public internet
- Do not commit generated reports to public repositories
- Review the security hardening recommendations before any production deployment

---

## Contributing

Contributions are welcome. Please open an issue first to discuss proposed changes.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built by [Rootless-Ghost](https://github.com/Rootless-Ghost) · NIST 800-61 Framework

</div>
