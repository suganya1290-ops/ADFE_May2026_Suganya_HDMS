"""
HDMS Phase 2 - ETL Pipeline for Historical Ticket Analytics
============================================================
Stages:
  1. EXTRACT  - Read raw CSV from datasets/historical_tickets.csv
  2. TRANSFORM - Deduplicate, normalise, enrich with time dimensions
  3. LOAD     - Write cleaned data + aggregated analytics tables to reporting.db

Run from project root:
    python etl/etl_pipeline.py
"""
import sqlite3
from datetime import datetime
from pathlib import Path

import pandas as pd

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).parent.parent          # project root
DATASET_PATH = ROOT / "datasets" / "historical_tickets.csv"
REPORTING_DB = ROOT / "reporting.db"

VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}
VALID_STATUSES   = {"Open", "In Progress", "Resolved", "Closed"}
VALID_CATEGORIES = {
    "VPN Issue", "Password Reset", "Software Installation",
    "Laptop Issue", "Email Access", "Network Connectivity", "Hardware Request",
}


# ---------------------------------------------------------------------------
# EXTRACT
# ---------------------------------------------------------------------------
def extract(csv_path: Path) -> pd.DataFrame:
    print(f"\n[EXTRACT] Source : {csv_path}")
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found: {csv_path}")
    df = pd.read_csv(csv_path, dtype=str)
    print(f"[EXTRACT] Records loaded : {len(df)}")
    print(f"[EXTRACT] Columns       : {list(df.columns)}")
    return df


# ---------------------------------------------------------------------------
# TRANSFORM
# ---------------------------------------------------------------------------
def transform(df: pd.DataFrame) -> pd.DataFrame:
    print(f"\n[TRANSFORM] Input records : {len(df)}")

    # 1. Strip whitespace from all string columns
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].str.strip()

    # 2. Normalise case-sensitive fields
    df["priority"]       = df["priority"].str.title()
    df["status"]         = df["status"].str.replace("_", " ").str.title()
    df["issue_category"] = df["issue_category"].str.strip()
    df["department"]     = df["department"].str.strip()
    df["employee_name"]  = df["employee_name"].str.strip()

    # 3. Drop exact duplicates
    before = len(df)
    df = df.drop_duplicates()
    print(f"[TRANSFORM] Exact duplicates removed     : {before - len(df)}")

    # 4. Drop near-duplicates (same employee + category + date = same incident)
    before = len(df)
    df = df.drop_duplicates(
        subset=["employee_name", "issue_category", "created_date"], keep="first"
    )
    print(f"[TRANSFORM] Near-duplicates removed      : {before - len(df)}")

    # 5. Parse dates
    df["created_date"]  = pd.to_datetime(df["created_date"],  errors="coerce")
    df["resolved_date"] = pd.to_datetime(df["resolved_date"], errors="coerce")

    # 6. Drop rows with unparseable created_date
    before = len(df)
    df = df.dropna(subset=["created_date"])
    print(f"[TRANSFORM] Invalid date rows removed    : {before - len(df)}")

    # 7. Coerce out-of-range values to NaN
    df.loc[~df["priority"].isin(VALID_PRIORITIES), "priority"]             = "Medium"
    df.loc[~df["status"].isin(VALID_STATUSES),     "status"]               = "Open"
    df.loc[~df["issue_category"].isin(VALID_CATEGORIES), "issue_category"] = "Other"

    # 8. Derive resolution_days
    df["resolution_days"] = (df["resolved_date"] - df["created_date"]).dt.days
    # Negative values are data errors — nullify
    df.loc[df["resolution_days"] < 0, "resolution_days"] = None

    # 9. Time dimensions for trend analytics
    df["created_month"]   = df["created_date"].dt.to_period("M").astype(str)
    df["created_quarter"] = df["created_date"].dt.to_period("Q").astype(str)
    df["created_year"]    = df["created_date"].dt.year

    # 10. ETL audit column
    df["etl_loaded_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Reorder columns for readability
    col_order = [
        "ticket_id", "employee_name", "department", "issue_category",
        "description", "priority", "status", "created_date", "resolved_date",
        "resolution_days", "created_month", "created_quarter", "created_year",
        "etl_loaded_at",
    ]
    df = df[[c for c in col_order if c in df.columns]]

    print(f"[TRANSFORM] Clean records output         : {len(df)}")
    return df.reset_index(drop=True)


# ---------------------------------------------------------------------------
# LOAD
# ---------------------------------------------------------------------------
def load(df: pd.DataFrame, db_path: Path) -> None:
    print(f"\n[LOAD] Target database : {db_path}")
    conn = sqlite3.connect(db_path)

    # ── Main reporting table ────────────────────────────────────────────────
    df.to_sql("reporting_tickets", conn, if_exists="replace", index=False)
    print(f"[LOAD] reporting_tickets  : {len(df)} rows written")

    # ── Category distribution ───────────────────────────────────────────────
    cat = df.groupby("issue_category").size().reset_index(name="count")
    cat = cat.sort_values("count", ascending=False)
    cat.to_sql("analytics_category", conn, if_exists="replace", index=False)

    # ── Priority distribution ───────────────────────────────────────────────
    _order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    pri = df.groupby("priority").size().reset_index(name="count")
    pri["_o"] = pri["priority"].map(_order).fillna(99)
    pri = pri.sort_values("_o").drop("_o", axis=1)
    pri.to_sql("analytics_priority", conn, if_exists="replace", index=False)

    # ── Status distribution ─────────────────────────────────────────────────
    sta = df.groupby("status").size().reset_index(name="count")
    sta = sta.sort_values("count", ascending=False)
    sta.to_sql("analytics_status", conn, if_exists="replace", index=False)

    # ── Department distribution ─────────────────────────────────────────────
    dep = df.groupby("department").size().reset_index(name="count")
    dep = dep.sort_values("count", ascending=False)
    dep.to_sql("analytics_department", conn, if_exists="replace", index=False)

    # ── Monthly resolution trend ────────────────────────────────────────────
    resolved = df[df["resolution_days"].notna()].copy()
    trend = (
        resolved.groupby("created_month")
        .agg(avg_resolution_days=("resolution_days", "mean"),
             ticket_count=("resolution_days", "count"))
        .reset_index()
        .rename(columns={"created_month": "month"})
        .sort_values("month")
    )
    trend["avg_resolution_days"] = trend["avg_resolution_days"].round(2)
    trend.to_sql("analytics_resolution_trend", conn, if_exists="replace", index=False)

    # ── ETL run log ─────────────────────────────────────────────────────────
    log = pd.DataFrame([{
        "run_at":          datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source_file":     str(DATASET_PATH),
        "records_loaded":  int(len(df)),
        "status":          "success",
    }])
    log.to_sql("etl_run_log", conn, if_exists="append", index=False)

    conn.close()
    print("[LOAD] Analytics tables: category, priority, status, department, resolution_trend")
    print("[LOAD] ETL run logged successfully.")


# ---------------------------------------------------------------------------
# PIPELINE ENTRY POINT
# ---------------------------------------------------------------------------
def run():
    print("=" * 62)
    print("  HDMS ETL Pipeline  |  Historical Ticket Analytics")
    print("=" * 62)
    raw_df   = extract(DATASET_PATH)
    clean_df = transform(raw_df)
    load(clean_df, REPORTING_DB)
    print("\n[ETL] Pipeline completed successfully.")
    print(f"[ETL] Reporting database : {REPORTING_DB}")


if __name__ == "__main__":
    run()
