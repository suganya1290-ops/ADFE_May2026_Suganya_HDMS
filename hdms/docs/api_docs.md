# HDMS — API Documentation

Base URL: `http://localhost:8000`

Interactive Swagger Docs: `http://localhost:8000/docs`

---

## Endpoints

### Root
**GET /**
- Description: API health check
- Response: `{ "message": "...", "version": "1.0.0", "docs": "/docs" }`

---

### Dashboard
**GET /dashboard**
- Description: Returns aggregate ticket stats
- Response:
```json
{
  "total": 10,
  "open": 4,
  "in_progress": 2,
  "resolved": 3,
  "closed": 1,
  "critical": 1,
  "high": 3
}
```

---

### Tickets

**GET /tickets**
- Description: Retrieve all tickets (paginated)
- Query params: `skip` (default 0), `limit` (default 100)
- Response: `{ "total": N, "tickets": [...] }`

---

**GET /tickets/{id}**
- Description: Get one ticket by ID
- 404 if not found

---

**POST /tickets**
- Description: Create a new ticket
- Status: 201 Created
- Body:
```json
{
  "employee_name": "string (required, min 2)",
  "department": "string (required, min 2)",
  "issue_category": "VPN Issue | Password Reset | Software Installation | Laptop Issue | Email Access | Network Connectivity | Hardware Request",
  "description": "string (required, min 10 chars)",
  "priority": "Low | Medium | High | Critical (default: Medium)"
}
```

---

**PUT /tickets/{id}**
- Description: Update an existing ticket (all fields optional)
- Body (partial update supported):
```json
{
  "employee_name": "string",
  "department": "string",
  "issue_category": "string",
  "description": "string",
  "priority": "Low | Medium | High | Critical",
  "status": "Open | In Progress | Resolved | Closed",
  "resolution_notes": "string"
}
```

---

**DELETE /tickets/{id}**
- Description: Delete a ticket
- Response: `{ "message": "Ticket N deleted successfully." }`
- 404 if not found

---

**GET /tickets/search**
- Description: Search and filter tickets
- Query params (all optional):
  - `keyword` — searches employee_name, department, description, category, notes
  - `category` — exact match on issue_category
  - `status` — exact match on status
  - `priority` — exact match on priority
- Response: `{ "total": N, "tickets": [...] }`

---

## Ticket Object

```json
{
  "ticket_id": 1,
  "employee_name": "Rahul Sharma",
  "department": "Engineering",
  "issue_category": "VPN Issue",
  "description": "Unable to connect to corporate VPN from home.",
  "priority": "High",
  "status": "Open",
  "resolution_notes": null,
  "created_at": "2025-01-15T10:30:00"
}
```

## Error Response

```json
{
  "detail": "Ticket with ID 99 not found."
}
```

## HTTP Status Codes Used

| Code | Meaning              |
|------|----------------------|
| 200  | OK                   |
| 201  | Created              |
| 404  | Not Found            |
| 422  | Validation Error     |
| 500  | Internal Server Error|
