"""
SIREN - Security Incident Response Engine & Notation
=====================================================
A professional incident response documentation tool following
the NIST 800-61 (Computer Security Incident Handling Guide) framework.

Built for SOC analysts, incident responders, and security teams
who need fast, structured, and exportable incident reports.

Author: Rootless-Ghost
License: MIT
"""

from flask import Flask, render_template, request, jsonify
from src.report_engine import IncidentReport, SeverityLevel, IncidentCategory
from src.report_exporter import ReportExporter
from datetime import datetime
import json
import os
import logging

app = Flask(__name__)
app.config["SECRET_KEY"] = os.urandom(32).hex()

# Basic logging configuration; can be overridden by application configuration
logging.basicConfig(level=logging.INFO)


@app.route("/")
def index():
    """Serve the main SIREN web interface."""
    return render_template(
        "index.html",
        severity_levels=[level.value for level in SeverityLevel],
        categories=[cat.value for cat in IncidentCategory],
    )


@app.route("/api/generate", methods=["POST"])
def generate_report():
    """
    Generate an incident report from submitted form data.

    Accepts JSON payload with incident metadata, timeline events,
    IOCs, affected systems, executive summary, and recommendations.

    Returns:
        JSON with Markdown and JSON exports of the report.
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # ------ Build the IncidentReport object ------
        report = IncidentReport(
            title=data.get("title", "Untitled Incident"),
            severity=data.get("severity", "Medium"),
            category=data.get("category", "Other"),
            analyst=data.get("analyst", "Unknown Analyst"),
            description=data.get("description", ""),
            detection_date=data.get("detection_date", ""),
            containment_date=data.get("containment_date", ""),
            eradication_date=data.get("eradication_date", ""),
            recovery_date=data.get("recovery_date", ""),
            executive_summary=data.get("executive_summary", ""),
        )

        # Timeline events
        for event in data.get("timeline_events", []):
            report.add_timeline_event(
                timestamp=event.get("timestamp", ""),
                description=event.get("description", ""),
                source=event.get("source", ""),
            )

        # Indicators of Compromise
        for ioc in data.get("iocs", []):
            report.add_ioc(
                ioc_type=ioc.get("type", ""),
                value=ioc.get("value", ""),
                context=ioc.get("context", ""),
            )

        # Affected systems
        for system in data.get("affected_systems", []):
            report.add_affected_system(
                hostname=system.get("hostname", ""),
                ip_address=system.get("ip_address", ""),
                impact=system.get("impact", ""),
            )

        # Recommendations
        for rec in data.get("recommendations", []):
            report.add_recommendation(rec)

        # ------ Export ------
        exporter = ReportExporter(report)
        markdown_output = exporter.to_markdown()
        json_output = exporter.to_json()

        return jsonify(
            {
                "success": True,
                "incident_id": report.incident_id,
                "markdown": markdown_output,
                "json": json_output,
            }
        )

    except Exception as e:
        logging.exception("Error generating incident report")
        return (
            jsonify(
                {
                    "error": "An internal error has occurred while generating the report."
                }
            ),
            500,
        )


@app.route("/api/sample", methods=["GET"])
def get_sample():
    """Return the sample Qakbot incident report for demo purposes."""
    sample_path = os.path.join(
        os.path.dirname(__file__), "samples", "sample_qakbot_incident.json"
    )
    try:
        with open(sample_path, "r") as f:
            sample_data = json.load(f)
        return jsonify(sample_data)
    except FileNotFoundError:
        return jsonify({"error": "Sample file not found"}), 404


if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("  SIREN - Security Incident Response Engine & Notation")
    print("=" * 55)
    print("  Running at: http://127.0.0.1:5000")
    print("  Press Ctrl+C to stop\n")
    debug_env = os.getenv("FLASK_DEBUG", "").lower()
    debug_mode = debug_env in ("1", "true", "yes")
    app.run(debug=debug_mode, host="127.0.0.1", port=5000)
