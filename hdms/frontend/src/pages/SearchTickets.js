import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ticketService } from "../services/api";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import "./SearchTickets.css";

const CATEGORIES = [
  "", "VPN Issue", "Password Reset", "Software Installation",
  "Laptop Issue", "Email Access", "Network Connectivity", "Hardware Request",
];
const STATUSES   = ["", "Open", "In Progress", "Resolved", "Closed"];
const PRIORITIES = ["", "Low", "Medium", "High", "Critical"];

export default function SearchTickets() {
  const [keyword, setKeyword]   = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus]     = useState("");
  const [priority, setPriority] = useState("");
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleSearch = useCallback(async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (keyword)  params.keyword  = keyword;
      if (category) params.category = category;
      if (status)   params.status   = status;
      if (priority) params.priority = priority;

      const res = await ticketService.search(params);
      setResults(res.data.tickets);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, status, priority]);

  const handleClear = () => {
    setKeyword(""); setCategory(""); setStatus(""); setPriority("");
    setResults([]); setSearched(false);
  };

  return (
    <div className="search-page animate-fade-up">
      <header className="page-header">
        <div>
          <h1 className="page-title">Search Tickets</h1>
          <p className="page-sub">Filter by keyword, category, status, or priority</p>
        </div>
      </header>

      <div className="search-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-keyword">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by keyword, employee, department…"
            />
          </div>

          <div className="search-filters">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="">All Priorities</option>
              {PRIORITIES.filter(Boolean).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </button>

            <button type="button" className="btn-secondary" onClick={handleClear}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {error && <div className="page-error" style={{ marginTop: "1rem" }}>{error}</div>}

      {searched && (
        <div className="search-results animate-fade-in">
          <div className="results-header">
            <span className="results-count">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {results.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">◎</div>
              <p>No tickets matched your search.</p>
            </div>
          ) : (
            <div className="table-card">
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
                  {results.map((t) => (
                    <tr key={t.ticket_id}>
                      <td><span className="ticket-id">#{t.ticket_id}</span></td>
                      <td><strong>{t.employee_name}</strong></td>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
