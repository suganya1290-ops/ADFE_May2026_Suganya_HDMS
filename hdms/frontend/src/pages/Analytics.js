import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { analyticsService } from "../services/api";
import "./Analytics.css";

const PRIORITY_COLORS = {
  Critical: "#ef4444",
  High:     "#f97316",
  Medium:   "#eab308",
  Low:      "#22c55e",
};

const STATUS_COLORS = {
  Open:          "#ef4444",
  "In Progress": "#f97316",
  Resolved:      "#22c55e",
  Closed:        "#6366f1",
};

const BAR_COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f43f5e",
  "#f97316","#eab308","#14b8a6","#3b82f6","#a855f7","#22c55e",
];

const TOOLTIP_STYLE = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#e2e8f0",
};

const TICK_STYLE = { fill: "#94a3b8", fontSize: 12 };

function StatCard({ label, value, accent }) {
  return (
    <div className="an-stat-card" style={{ borderTopColor: accent }}>
      <div className="an-stat-label">{label}</div>
      <div className="an-stat-value">{value ?? "—"}</div>
    </div>
  );
}

export default function Analytics() {
  const [summary,     setSummary]     = useState(null);
  const [categories,  setCategories]  = useState([]);
  const [priorities,  setPriorities]  = useState([]);
  const [departments, setDepartments] = useState([]);
  const [statuses,    setStatuses]    = useState([]);
  const [trends,      setTrends]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    Promise.all([
      analyticsService.getSummary(),
      analyticsService.getCategoryDistribution(),
      analyticsService.getPriorityDistribution(),
      analyticsService.getDepartmentDistribution(),
      analyticsService.getStatusDistribution(),
      analyticsService.getResolutionTrends(),
    ])
      .then(([sum, cat, pri, dep, sta, tre]) => {
        setSummary(sum.data);
        setCategories(cat.data);
        setPriorities(pri.data);
        setDepartments(dep.data);
        setStatuses(sta.data);
        setTrends(tre.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="an-center an-muted">Loading analytics…</div>;

  if (error)
    return (
      <div className="an-center">
        <div className="an-error-box">
          <strong>Analytics unavailable</strong>
          <p>{error}</p>
          <p className="an-hint">Run the ETL pipeline first: <code>python etl/etl_pipeline.py</code></p>
        </div>
      </div>
    );

  if (!summary?.total_tickets)
    return (
      <div className="an-center">
        <div className="an-error-box">
          <strong>No analytics data found</strong>
          <p className="an-hint">Run the ETL pipeline to populate the reporting database:</p>
          <code>python etl/etl_pipeline.py</code>
        </div>
      </div>
    );

  return (
    <div className="an-page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="an-header">
        <div>
          <h1 className="page-title">ETL Analytics Dashboard</h1>
          <p className="an-subtitle">Historical ticket data · Phase 2</p>
        </div>
        {summary?.etl_run && (
          <div className="an-etl-badge">
            <span className="an-etl-dot" />
            Last ETL run: <strong>{summary.etl_run.run_at}</strong>
            &nbsp;·&nbsp;{summary.etl_run.records_loaded} records loaded
          </div>
        )}
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="an-stats-grid">
        <StatCard label="Total Historical Tickets" value={summary?.total_tickets} accent="#6366f1" />
        <StatCard label="Avg Resolution (Days)"    value={summary?.avg_resolution_days} accent="#22c55e" />
        <StatCard label="Top Issue Category"        value={summary?.top_category}        accent="#f97316" />
        <StatCard label="Open / In Progress"        value={summary?.open_tickets}        accent="#ef4444" />
      </div>

      {/* ── Row 1: Category bar + Priority pie ──────────────────────────── */}
      <div className="an-charts-row">
        <div className="an-chart-card">
          <h2 className="an-chart-title">Issue Category Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categories} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="category" tick={{ ...TICK_STYLE, fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={TICK_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]}>
                {categories.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="an-chart-card">
          <h2 className="an-chart-title">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={priorities}
                dataKey="count"
                nameKey="priority"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label={({ priority, percent }) =>
                  `${priority} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: "#475569" }}
              >
                {priorities.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={PRIORITY_COLORS[entry.priority] || BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: Department bar + Resolution trend line ────────────────── */}
      <div className="an-charts-row">
        <div className="an-chart-card">
          <h2 className="an-chart-title">Department-wise Ticket Count</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departments} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={TICK_STYLE} />
              <YAxis dataKey="department" type="category" tick={TICK_STYLE} width={95} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Tickets" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="an-chart-card">
          <h2 className="an-chart-title">Monthly Avg Resolution Trend (Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ ...TICK_STYLE, fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={TICK_STYLE} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 13 }} />
              <Line
                type="monotone"
                dataKey="avg_resolution_days"
                name="Avg Days"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Status Distribution ──────────────────────────────────────────── */}
      <div className="an-chart-card">
        <h2 className="an-chart-title">Status Distribution</h2>
        <div className="an-status-grid">
          {statuses.map((s) => (
            <div
              key={s.status}
              className="an-status-tile"
              style={{ borderColor: STATUS_COLORS[s.status] || "#6366f1" }}
            >
              <div className="an-status-count">{s.count}</div>
              <div className="an-status-label">{s.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
