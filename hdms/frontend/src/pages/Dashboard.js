import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardService, ticketService } from "../services/api";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import "./Dashboard.css";

const STAT_CARDS = [
  { key: "total",       label: "Total Tickets",  color: "accent",  icon: "⬡" },
  { key: "open",        label: "Open",           color: "blue",    icon: "◉" },
  { key: "in_progress", label: "In Progress",    color: "yellow",  icon: "◷" },
  { key: "resolved",    label: "Resolved",       color: "green",   icon: "✓" },
  { key: "critical",    label: "Critical",       color: "red",     icon: "!" },
  { key: "closed",      label: "Closed",         color: "dim",     icon: "✕" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([dashboardService.getStats(), ticketService.getAll({ limit: 5 })])
      .then(([statsRes, ticketsRes]) => {
        setStats(statsRes.data);
        setRecent(ticketsRes.data.tickets);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard…</div>;
  if (error)   return <div className="page-error">Error: {error}</div>;

  return (
    <div className="dashboard animate-fade-up">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Real-time overview of all support tickets</p>
        </div>
        <Link to="/create" className="btn-primary">+ New Ticket</Link>
      </header>

      <div className="stat-grid">
        {STAT_CARDS.map((card, i) => (
          <div
            key={card.key}
            className={`stat-card stat-${card.color}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value">{stats?.[card.key] ?? 0}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <section className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Recent Tickets</h2>
          <Link to="/tickets" className="view-all">View all →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">No tickets yet. <Link to="/create">Create one</Link>.</div>
        ) : (
          <table className="ticket-table">
            <thead>
              <tr>
                <th>#ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.ticket_id}>
                  <td><span className="ticket-id">#{t.ticket_id}</span></td>
                  <td>{t.employee_name}</td>
                  <td className="text-muted">{t.department}</td>
                  <td>{t.issue_category}</td>
                  <td><PriorityBadge value={t.priority} /></td>
                  <td><StatusBadge value={t.status} /></td>
                  <td className="text-muted text-mono">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/tickets/${t.ticket_id}`} className="table-action">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
