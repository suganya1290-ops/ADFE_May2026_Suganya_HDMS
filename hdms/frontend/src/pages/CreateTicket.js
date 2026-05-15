import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const INITIAL = {
  employee_name: "",
  department: "",
  issue_category: "",
  description: "",
  priority: "Medium",
};

function validate(form) {
  const errors = {};
  if (!form.employee_name.trim()) errors.employee_name = "Employee name is required.";
  if (!form.department.trim())    errors.department = "Department is required.";
  if (!form.issue_category)       errors.issue_category = "Please select a category.";
  if (form.description.trim().length < 10) errors.description = "Description must be at least 10 characters.";
  return errors;
}

export default function CreateTicket() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setApiError(null);

    try {
      const res = await ticketService.create(form);
      navigate(`/tickets/${res.data.ticket_id}`);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page animate-fade-up">
      <header className="page-header">
        <div>
          <h1 className="page-title">New Ticket</h1>
          <p className="page-sub">Submit a support request to the IT helpdesk</p>
        </div>
      </header>

      <div className="form-card">
        {apiError && <div className="form-api-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employee Name <span className="required">*</span></label>
              <input
                name="employee_name"
                value={form.employee_name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
              />
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
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.issue_category && <span className="form-error">{errors.issue_category}</span>}
            </div>

            <div className="form-group">
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
          </div>

          <div className="form-group">
            <label className="form-label">Description <span className="required">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe the issue in detail…"
            />
            <div className="char-count">{form.description.length} chars</div>
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
