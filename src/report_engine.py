"""
SIREN Report Engine
====================
Core incident report data model and business logic.
Handles incident metadata, timeline events, IOCs, affected systems,
and severity scoring following NIST 800-61 guidelines.
"""

from enum import Enum
from datetime import datetime
from dataclasses import dataclass, field
from typing import List, Optional
import uuid
import hashlib


class SeverityLevel(Enum):
    """Incident severity levels aligned with common SOC triage scales."""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class IncidentCategory(Enum):
    """Incident classification categories based on NIST 800-61 taxonomy."""
    MALWARE = "Malware Incident"
    PHISHING = "Phishing Attack"
    UNAUTHORIZED_ACCESS = "Unauthorized Access"
    DDOS = "DDoS Attack"
    DATA_BREACH = "Data Breach"
    INSIDER_THREAT = "Insider Threat"
    WEB_APP_ATTACK = "Web Application Attack"
    RANSOMWARE = "Ransomware"
    OTHER = "Other"


# Severity scoring weights used by the calculate_severity_score() method
SEVERITY_WEIGHTS = {
    "Low": 1,
    "Medium": 2,
    "High": 3,
    "Critical": 4,
}


@dataclass
class TimelineEvent:
    """A single event in the incident timeline."""
    timestamp: str
    description: str
    source: str = ""

    def to_dict(self) -> dict:
        return {
            "timestamp": self.timestamp,
            "description": self.description,
            "source": self.source,
        }


@dataclass
class IOC:
    """An Indicator of Compromise associated with the incident."""
    ioc_type: str       # IP Address, Domain, URL, File Hash, Email, Username
    value: str
    context: str = ""

    def to_dict(self) -> dict:
        return {
            "type": self.ioc_type,
            "value": self.value,
            "context": self.context,
        }


@dataclass
class AffectedSystem:
    """A system impacted by the incident."""
    hostname: str
    ip_address: str
    impact: str = ""

    def to_dict(self) -> dict:
        return {
            "hostname": self.hostname,
            "ip_address": self.ip_address,
            "impact": self.impact,
        }


@dataclass
class IncidentReport:
    """
    Core incident report object.

    Collects all metadata, timeline, IOCs, affected systems, and
    recommendations into a single structured object that can be
    serialized to Markdown, JSON, or HTML by ReportExporter.
    """

    title: str
    severity: str = "Medium"
    category: str = "Other"
    analyst: str = ""
    description: str = ""
    detection_date: str = ""
    containment_date: str = ""
    eradication_date: str = ""
    recovery_date: str = ""
    executive_summary: str = ""

    # Auto-generated fields
    incident_id: str = field(default_factory=str)
    created_at: str = field(default_factory=str)

    # Collections
    timeline_events: List[TimelineEvent] = field(default_factory=list)
    iocs: List[IOC] = field(default_factory=list)
    affected_systems: List[AffectedSystem] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)

    def __post_init__(self):
        """Generate incident ID and creation timestamp on init."""
        if not self.incident_id:
            self.incident_id = self._generate_incident_id()
        if not self.created_at:
            self.created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    def _generate_incident_id(self) -> str:
        """
        Generate a deterministic-looking incident ID.
        Format: IR-YYYYMMDD-XXXX (e.g., IR-20250211-A3F7)
        """
        date_part = datetime.utcnow().strftime("%Y%m%d")
        hash_input = f"{self.title}{datetime.utcnow().isoformat()}{uuid.uuid4()}"
        hash_suffix = hashlib.sha256(hash_input.encode()).hexdigest()[:4].upper()
        return f"IR-{date_part}-{hash_suffix}"

    # ------------------------------------------------------------------
    # Builder methods
    # ------------------------------------------------------------------

    def add_timeline_event(self, timestamp: str, description: str, source: str = ""):
        """Add an event to the incident timeline."""
        event = TimelineEvent(
            timestamp=timestamp,
            description=description,
            source=source,
        )
        self.timeline_events.append(event)
        # Keep timeline sorted chronologically
        self.timeline_events.sort(key=lambda e: e.timestamp)

    def add_ioc(self, ioc_type: str, value: str, context: str = ""):
        """Register an Indicator of Compromise."""
        indicator = IOC(ioc_type=ioc_type, value=value, context=context)
        self.iocs.append(indicator)

    def add_affected_system(self, hostname: str, ip_address: str, impact: str = ""):
        """Document an affected system."""
        system = AffectedSystem(
            hostname=hostname, ip_address=ip_address, impact=impact
        )
        self.affected_systems.append(system)

    def add_recommendation(self, recommendation: str):
        """Add a remediation / follow-up recommendation."""
        if recommendation.strip():
            self.recommendations.append(recommendation.strip())

    # ------------------------------------------------------------------
    # Severity scoring
    # ------------------------------------------------------------------

    def calculate_severity_score(self) -> dict:
        """
        Calculate a composite severity score based on multiple factors:
        - Base severity weight
        - Number of IOCs discovered
        - Number of systems affected
        - Whether the incident is categorized as Critical

        Returns a dict with numeric score, rating label, and breakdown.
        """
        base = SEVERITY_WEIGHTS.get(self.severity, 2)
        ioc_factor = min(len(self.iocs) * 0.5, 3)         # cap at 3
        system_factor = min(len(self.affected_systems) * 0.75, 3)  # cap at 3
        critical_bonus = 1.5 if self.severity == "Critical" else 0

        raw = base + ioc_factor + system_factor + critical_bonus
        score = round(min(raw, 10), 1)  # normalize to 0-10

        if score >= 8:
            rating = "CRITICAL"
        elif score >= 6:
            rating = "HIGH"
        elif score >= 4:
            rating = "MEDIUM"
        else:
            rating = "LOW"

        return {
            "score": score,
            "rating": rating,
            "breakdown": {
                "base_severity": base,
                "ioc_factor": round(ioc_factor, 1),
                "system_factor": round(system_factor, 1),
                "critical_bonus": critical_bonus,
            },
        }

    # ------------------------------------------------------------------
    # Serialization
    # ------------------------------------------------------------------

    def to_dict(self) -> dict:
        """Serialize the full report to a dictionary."""
        return {
            "incident_id": self.incident_id,
            "title": self.title,
            "severity": self.severity,
            "category": self.category,
            "analyst": self.analyst,
            "description": self.description,
            "created_at": self.created_at,
            "dates": {
                "detection": self.detection_date,
                "containment": self.containment_date,
                "eradication": self.eradication_date,
                "recovery": self.recovery_date,
            },
            "executive_summary": self.executive_summary,
            "severity_score": self.calculate_severity_score(),
            "timeline": [e.to_dict() for e in self.timeline_events],
            "iocs": [i.to_dict() for i in self.iocs],
            "affected_systems": [s.to_dict() for s in self.affected_systems],
            "recommendations": self.recommendations,
        }
