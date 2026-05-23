from fastapi import APIRouter
import sqlite3
from pathlib import Path
from typing import Any, Dict, List

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# reporting.db lives at project root (4 levels up from this file)
REPORTING_DB: Path = Path(__file__).parent.parent.parent.parent / "reporting.db"


def _query(sql: str) -> List[Dict[str, Any]]:
    if not REPORTING_DB.exists():
        return []
    conn = sqlite3.connect(REPORTING_DB)
    conn.row_factory = sqlite3.Row
    rows = [dict(r) for r in conn.execute(sql).fetchall()]
    conn.close()
    return rows


@router.get("/summary")
def analytics_summary():
    """Aggregate KPIs — total tickets, avg resolution, top category, open count."""
    if not REPORTING_DB.exists():
        return {
            "etl_run": None,
            "total_tickets": 0,
            "avg_resolution_days": None,
            "top_category": None,
            "open_tickets": 0,
        }

    conn = sqlite3.connect(REPORTING_DB)
    conn.row_factory = sqlite3.Row

    total = conn.execute("SELECT COUNT(*) AS n FROM reporting_tickets").fetchone()["n"]

    avg_row = conn.execute(
        "SELECT ROUND(AVG(resolution_days), 1) AS avg FROM reporting_tickets "
        "WHERE resolution_days IS NOT NULL AND resolution_days >= 0"
    ).fetchone()
    avg_res = avg_row["avg"]

    top_cat_row = conn.execute(
        "SELECT issue_category FROM analytics_category ORDER BY count DESC LIMIT 1"
    ).fetchone()
    top_cat = top_cat_row["issue_category"] if top_cat_row else None

    open_row = conn.execute(
        "SELECT COUNT(*) AS n FROM reporting_tickets "
        "WHERE status IN ('Open', 'In Progress')"
    ).fetchone()
    open_count = open_row["n"]

    last_run_row = conn.execute(
        "SELECT run_at, records_loaded FROM etl_run_log ORDER BY run_at DESC LIMIT 1"
    ).fetchone()
    last_run = dict(last_run_row) if last_run_row else None

    conn.close()
    return {
        "etl_run": last_run,
        "total_tickets": total,
        "avg_resolution_days": avg_res,
        "top_category": top_cat,
        "open_tickets": open_count,
    }


@router.get("/category-distribution")
def category_distribution():
    """Ticket count grouped by issue category, descending."""
    return _query(
        "SELECT issue_category AS category, count FROM analytics_category ORDER BY count DESC"
    )


@router.get("/priority-distribution")
def priority_distribution():
    """Ticket count grouped by priority (Critical → Low)."""
    return _query("SELECT priority, count FROM analytics_priority")


@router.get("/status-distribution")
def status_distribution():
    """Ticket count grouped by status."""
    return _query("SELECT status, count FROM analytics_status ORDER BY count DESC")


@router.get("/department-distribution")
def department_distribution():
    """Ticket count grouped by department, descending."""
    return _query(
        "SELECT department, count FROM analytics_department ORDER BY count DESC"
    )


@router.get("/resolution-trends")
def resolution_trends():
    """Monthly average resolution time and resolved ticket count."""
    return _query(
        "SELECT month, avg_resolution_days, ticket_count "
        "FROM analytics_resolution_trend ORDER BY month"
    )


@router.get("/etl-status")
def etl_status():
    """ETL run history and database availability."""
    runs = _query(
        "SELECT run_at, source_file, records_loaded, status "
        "FROM etl_run_log ORDER BY run_at DESC LIMIT 10"
    )
    return {"db_exists": REPORTING_DB.exists(), "runs": runs}
