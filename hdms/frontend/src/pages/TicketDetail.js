import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ticketService } from "../services/api";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import "./TicketDetail.css";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ticketService.getById(id)
      .then((res) => {
        setTicket(res.data);
        setResolutionNotes(res.data.resolution_notes || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await ticketService.update(id, { status: newStatus });
      setTicket(res.data);
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const res = await ticketService.update(id, { resolution_notes: resolutionNotes });
      setTicket(res.data);
      alert("Resolution notes saved.");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ticket #${id}?`)) return;
    try {
      await ticketService.delete(id);
      navigate("/tickets");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  if (loading) return <div className="page-loading">Loading ticket…</div>;
  if (error)   return <div className="page-error">Error: {error}</div>;
  if (!ticket) return <div className="page-error">Ticket not found.</div>;

  return (
    <div className="detail-page animate-fade-up">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/tickets">All Tickets</Link>
            <span>›</span>
            <span>#{ticket.ticket_id}</span>
          </div>
          <h1 className="page-title">{ticket.issue_category}</h1>
        </div>
        <div className="header-actions">
          <Link to={`/tickets/${id}/edit`} className="btn-secondary">Edit</Link>
          <button className="btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </header>

      <div className="detail-grid">
        {/* Left: ticket info */}
        <div className="detail-main">
          <div className="detail-card">
            <h3 className="card-section-title">Ticket Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Ticket ID</span>
                <span className="info-value ticket-id">#{ticket.ticket_id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Employee</span>
                <span className="info-value">{ticket.employee_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{ticket.department}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Category</span>
                <span className="info-value">{ticket.issue_category}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Priority</span>
                <span className="info-value"><PriorityBadge value={ticket.priority} /></span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className="info-value"><StatusBadge value={ticket.status} /></span>
              </div>
              <div className="info-item">
                <span className="info-label">Created At</span>
                <span className="info-value text-mono">
                  {new Date(ticket.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="description-section">
              <h4 className="info-label" style={{ marginBottom: "0.5rem" }}>Description</h4>
              <p className="description-text">{ticket.description}</p>
            </div>
          </div>

          {/* Resolution Notes */}
          <div className="detail-card">
            <h3 className="card-section-title">Resolution Notes</h3>
            <textarea
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Add resolution details here…"
            />
            <button
              className="btn-primary"
              style={{ marginTop: "0.75rem" }}
              onClick={handleSaveNotes}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Notes"}
            </button>
          </div>
        </div>

        {/* Right: status updater */}
        <div className="detail-sidebar">
          <div className="detail-card">
            <h3 className="card-section-title">Update Status</h3>
            <div className="status-buttons">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`status-btn ${ticket.status === s ? "active" : ""}`}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || ticket.status === s}
                >
                  <StatusBadge value={s} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
