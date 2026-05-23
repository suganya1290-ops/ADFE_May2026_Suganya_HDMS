"""
Dataset generator for HDMS Phase 2 ETL Pipeline.
Produces datasets/historical_tickets.csv with 225 rows (220 unique + 5 duplicates).
Run: python datasets/generate_dataset.py
"""
import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

random.seed(42)

EMPLOYEES = [
    ("Alice Johnson", "IT"),
    ("Bob Smith", "HR"),
    ("Carol Williams", "Finance"),
    ("David Brown", "Engineering"),
    ("Emma Davis", "Marketing"),
    ("Frank Miller", "Admin"),
    ("Grace Wilson", "Operations"),
    ("Henry Moore", "Legal"),
    ("Iris Taylor", "Sales"),
    ("Jack Anderson", "Support"),
    ("Karen Thomas", "IT"),
    ("Liam Jackson", "HR"),
    ("Maria White", "Finance"),
    ("Nathan Harris", "Engineering"),
    ("Olivia Martin", "Marketing"),
    ("Peter Thompson", "Admin"),
    ("Quinn Garcia", "Operations"),
    ("Rachel Martinez", "Legal"),
    ("Steve Robinson", "Sales"),
    ("Tara Clark", "Support"),
    ("Uma Rodriguez", "IT"),
    ("Victor Lewis", "HR"),
    ("Wendy Lee", "Engineering"),
    ("Xavier Walker", "Finance"),
    ("Yara Hall", "Marketing"),
    ("Zachary Allen", "Admin"),
    ("Amy Young", "IT"),
    ("Brian King", "Operations"),
    ("Catherine Wright", "HR"),
    ("Daniel Scott", "Engineering"),
]

CATEGORIES = [
    "VPN Issue",
    "Password Reset",
    "Software Installation",
    "Laptop Issue",
    "Email Access",
    "Network Connectivity",
    "Hardware Request",
]

DESCRIPTIONS = {
    "VPN Issue": [
        "VPN connection fails when accessing from home network",
        "Unable to establish VPN tunnel from remote location",
        "VPN client crashes on startup after Windows update",
        "Intermittent VPN disconnections during work hours",
        "VPN authentication fails with corporate credentials",
        "VPN speed is extremely slow affecting productivity",
        "Split tunneling not working correctly on VPN client",
    ],
    "Password Reset": [
        "Corporate email password expired and cannot reset via portal",
        "Account locked after multiple failed login attempts",
        "Need password reset for Active Directory account",
        "Cannot access company systems due to forgotten password",
        "Password reset link not received in email",
        "Two-factor authentication not sending OTP to phone",
        "SSO credentials not accepted by internal applications",
    ],
    "Software Installation": [
        "Need Microsoft Office 365 installed on new workstation",
        "Requesting Adobe Creative Suite license and installation",
        "Python development environment setup required",
        "Need Slack desktop client installed and configured",
        "Zoom application not installed on company laptop",
        "AutoCAD installation required for engineering team",
        "Antivirus software outdated and needs update",
    ],
    "Laptop Issue": [
        "Laptop screen flickering intermittently during presentations",
        "Company laptop battery not charging properly",
        "Keyboard keys are stuck and not responding correctly",
        "Laptop overheating and shutting down unexpectedly",
        "Blue screen of death appearing after OS update",
        "Laptop touchpad not responding to gestures",
        "Laptop fan making loud grinding noise",
    ],
    "Email Access": [
        "Cannot access corporate email on mobile device",
        "Outlook not syncing emails from Exchange server",
        "Email account suspended due to suspected phishing activity",
        "Unable to send emails, getting delivery failure errors",
        "Need access to shared mailbox for department communications",
        "Email signature not rendering correctly in Outlook",
        "Calendar invites not being received by external parties",
    ],
    "Network Connectivity": [
        "Network drops intermittently in the west wing office",
        "Cannot connect to office Wi-Fi network",
        "Slow internet connection affecting productivity",
        "Network printer not accessible from workstation",
        "Ethernet port not working at assigned desk",
        "Cannot reach internal file server from workstation",
        "Firewall blocking access to required development tools",
    ],
    "Hardware Request": [
        "Requesting external monitor for dual-screen setup",
        "Need wireless keyboard and mouse for ergonomic workstation",
        "Requesting USB-C docking station for laptop",
        "New headset needed for remote conference calls",
        "Requesting ergonomic chair and standing desk converter",
        "Need webcam for video conferencing setup",
        "Requesting portable SSD for data backup",
    ],
}

PRIORITY_POOL = ["Critical", "High", "High", "Medium", "Medium", "Medium", "Low", "Low"]
STATUS_POOL = ["Open", "In Progress", "Resolved", "Resolved", "Resolved", "Closed", "Resolved", "Closed"]

START_DATE = datetime(2024, 5, 1)


def make_rows(count: int):
    rows = []
    for i in range(count):
        emp_name, dept = EMPLOYEES[i % len(EMPLOYEES)]
        category = CATEGORIES[i % len(CATEGORIES)]
        priority = PRIORITY_POOL[i % len(PRIORITY_POOL)]
        status = STATUS_POOL[i % len(STATUS_POOL)]
        description = DESCRIPTIONS[category][i % len(DESCRIPTIONS[category])]

        # Spread dates over 12 months (~18 tickets per month)
        month_offset = i // 18
        day_in_month = (i % 18) * 1 + 2
        created = START_DATE + timedelta(days=month_offset * 30 + day_in_month)

        resolved = ""
        if status in ("Resolved", "Closed"):
            res_days = (i % 22) + 2  # 2–23 days to resolve
            resolved = (created + timedelta(days=res_days)).strftime("%Y-%m-%d")

        rows.append({
            "ticket_id": i + 1,
            "employee_name": emp_name,
            "department": dept,
            "issue_category": category,
            "description": description,
            "priority": priority,
            "status": status,
            "created_date": created.strftime("%Y-%m-%d"),
            "resolved_date": resolved,
        })
    return rows


def main():
    out_path = Path(__file__).parent / "historical_tickets.csv"
    rows = make_rows(220)

    # Inject 5 deliberate duplicates for ETL deduplication demo
    dup_indices = [4, 11, 43, 77, 102]
    for idx in dup_indices:
        rows.append(rows[idx].copy())

    fieldnames = ["ticket_id", "employee_name", "department", "issue_category",
                  "description", "priority", "status", "created_date", "resolved_date"]

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Generated {len(rows)} rows (220 unique + 5 duplicates) -> {out_path}")


if __name__ == "__main__":
    main()
