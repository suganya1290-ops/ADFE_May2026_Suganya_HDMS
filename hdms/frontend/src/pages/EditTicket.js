import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketService } from "../services/api";
import "./TicketForm.css";

const DEPARTMENTS = [
  "Administration",
  "Customer Support",
  "Engineering",
  "Finance",
  "Human Resources",
  "Information Technology",
  "Legal",
  "Marketing",
  "Operations",
  "Product",
  "Research & Development",
  "Sales",
];

const CATEGORIES = [
  "VPN Issue", "Password Reset", "Software Installation",
  "Laptop Issue", "Email Access", "Network Connectivity", "Hardware Request",
];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export default function EditTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketService.getById(id)
      .then((res) => {
        const t = res.data;
        setForm({
          employee_name: t.employee_name,
          department: t.department,
          issue_category: t.issue_category,
          description: t.description,
          priority: t.priority,
          status: t.status,
          resolution_notes: t.resolution_notes || "",
        });
      })
      .catch((err) => setApiError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.employee_name.trim()) errs.employee_name = "Required.";
    if (!form.department.trim())    errs.department = "Required.";
    if (!form.issue_category)       errs.issue_category = "Required.";
    if (form.description.trim().length < 10) errs.description = "Min 10 characters.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError(null);

    try {
      await ticketService.update(id, form);
      navigate(`/tickets/${id}`);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading ticket…</div>;
  if (!form)   return <div className="page-error">{apiError || "Ticket not found."}</div>;

  return (
    <div className="form-page animate-fade-up">
      <header className="page-header">
        <div>
          <h1 className="page-title">Edit Ticket #{id}</h1>
          <p className="page-sub">Modify ticket details or update status</p>
        </div>
      </header>

      <div className="form-card">
        {apiError && <div className="form-api-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employee Name <span className="required">*</span></label>
              <input name="employee_name" value={form.employee_name} onChange={handleChange} />
              {errors.employee_name && <span className="form-error">{errors.employee_name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Department <span className="required">*</span></label>
              <select name="department" value={form.department} onChange={handleChange}>
                <option value="">Select department…</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className="form-error">{errors.department}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Issue Category <span className="required">*</span></label>
              <select name="issue_category" value={form.issue_category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.issue_category && <span className="form-error">{errors.issue_category}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">Priority</label>
            <div className="priority-selector">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={`priority-btn priority-${p.toLowerCase()} ${form.priority === p ? "selected" : ""}`}
                  onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">Description <span className="required">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label">Resolution Notes</label>
            <textarea name="resolution_notes" value={form.resolution_notes} onChange={handleChange} rows={3} placeholder="Add resolution details…" />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
