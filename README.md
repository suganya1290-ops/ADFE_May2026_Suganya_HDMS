# HDMS — Helpdesk Ticket Management System

A full-stack IT support ticket system.  
**Backend:** Python · FastAPI · SQLAlchemy · SQLite  
**Frontend:** React 18 · React Router v6 · Axios

---

## Project Structure

```
HDMS_Project1/
└── hdms/
    ├── backend/          Python FastAPI server
    │   ├── main.py
    │   ├── database.py
    │   ├── models.py
    │   ├── schemas.py
    │   ├── crud.py
    │   ├── requirements.txt
    │   └── routers/
    │       └── tickets.py
    └── frontend/         React app
        ├── package.json
        ├── public/
        └── src/
            ├── index.js
            ├── App.js
            ├── index.css
            ├── components/
            │   ├── Badge.js
            │   ├── Navbar.js
            │   └── Navbar.css
            ├── pages/
            └── services/
                └── api.js
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| pip | latest |
| Node.js | 16+ |
| npm | 8+ |

---

## Backend Setup & Run

```bash
# 1. Navigate to backend folder
cd hdms/backend

# 2. (Optional) Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Start the development server (auto-reloads on code changes)
python -m uvicorn main:app --reload

# The API is now running at:  http://localhost:8000
# Interactive API docs at:    http://localhost:8000/docs
# Alternative API docs at:    http://localhost:8000/redoc
```

### Run on a custom port

```bash
python -m uvicorn main:app --reload --port 8080
```

---

## Frontend Setup & Run

```bash
# 1. Navigate to frontend folder
cd hdms/frontend

# 2. Install npm dependencies (first time only)
npm install

# 3. Start the React development server
npm start

# The app opens at: http://localhost:3000
```

### Production build

```bash
# Build optimised static files into hdms/frontend/build/
npm run build

# Serve the built files locally with:
npx serve -s build
```

---

## Running Both Servers Together

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd hdms/backend
python -m uvicorn main:app --reload
```

**Terminal 2 — Frontend**
```bash
cd hdms/frontend
npm start
```

Then open **http://localhost:3000** in your browser.

---

## API Endpoints

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/dashboard` | Aggregate ticket stats |
| GET | `/tickets` | List all tickets |
| GET | `/tickets/{id}` | Get single ticket |
| GET | `/tickets/search` | Search / filter tickets |
| POST | `/tickets` | Create new ticket |
| PUT | `/tickets/{id}` | Update ticket |
| DELETE | `/tickets/{id}` | Delete ticket |

### Query parameters for `/tickets/search`

| Param | Example |
|-------|---------|
| `keyword` | `?keyword=vpn` |
| `category` | `?category=VPN+Issue` |
| `status` | `?status=Open` |
| `priority` | `?priority=High` |

### Sample — Create a ticket

```bash
curl -X POST http://localhost:8000/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "employee_name": "Rahul Sharma",
    "department": "Engineering",
    "issue_category": "VPN Issue",
    "description": "Unable to connect to corporate VPN from home.",
    "priority": "High"
  }'
```

### Sample — Update ticket status

```bash
curl -X PUT http://localhost:8000/tickets/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress"}'
```

### Sample — Search tickets

```bash
curl "http://localhost:8000/tickets/search?keyword=vpn&priority=High"
```

---

## Valid Enum Values

**Priority:** `Low` · `Medium` · `High` · `Critical`

**Status:** `Open` · `In Progress` · `Resolved` · `Closed`

**Issue Category:**
- `VPN Issue`
- `Password Reset`
- `Software Installation`
- `Laptop Issue`
- `Email Access`
- `Network Connectivity`
- `Hardware Request`

---

## Database

SQLite database file created automatically on first run:

```
hdms/backend/helpdesk.db
```

To reset the database (delete all data):

```bash
# From hdms/backend/
del helpdesk.db        # Windows
rm helpdesk.db         # macOS/Linux
```

The database is re-created automatically when the server starts again.

---

## Bugs Fixed

| # | File | Issue |
|---|------|-------|
| 1 | `backend/routers/__init__.py` | Missing file — Python could not import the `routers` package |
| 2 | `frontend/src/components/Badge.js` | Missing file — `PriorityBadge` and `StatusBadge` imported by 4 pages |
| 3 | `frontend/src/App.js` | Missing file — React app had no router or layout wrapper |
| 4 | `frontend/src/index.js` | Missing file — React app had no entry point |
| 5 | `frontend/src/index.css` | Missing file — all CSS custom properties (`--accent`, `--surface`, etc.) undefined |
| 6 | `frontend/src/components/Navbar.css` | Missing file — Navbar import failed at runtime |
| 7 | `frontend/package.json` | No React dependencies or npm scripts defined |
