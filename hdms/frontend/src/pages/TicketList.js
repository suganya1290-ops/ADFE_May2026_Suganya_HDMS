import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ticketService } from "../services/api";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import "./TicketList.css";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchTickets = () => {
    setLoading(true);
    ticketService.getAll()
      .then((res) => setTickets(res.data.tickets))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete ticket #${id}?`)) return;
    try {
      await ticketService.delete(id);
      setTickets((prev) => prev.filter((t) => t.ticket_id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  if (loading) return <div className="page-loading">Loading tickets…</div>;
  if (error)   return <div className="page-error">Error: {error}</div>;

  return (
    <div className="ticket-list-page animate-fade-up">
      <header className="page-header">
        <div>
          <h1 className="page-title">All Tickets</h1>
          <p className="page-sub">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""} found</p>
        </div>
        <Link to="/create" className="btn-primary">+ New Ticket</Link>
      </header>

      {tickets.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">◉</div>
          <p>No tickets yet.</p>
          <Link to="/create" className="btn-primary" style={{ marginTop: "1rem" }}>Create first ticket</Link>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
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
                    <div className="action-btns">
                      <Link to={`/tickets/${t.ticket_id}`} className="action-btn action-view">View</Link>
                      <Link to={`/tickets/${t.ticket_id}/edit`} className="action-btn action-edit">Edit</Link>
                      <button
                        className="action-btn action-delete"
                        onClick={() => handleDelete(t.ticket_id)}
                      >Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
