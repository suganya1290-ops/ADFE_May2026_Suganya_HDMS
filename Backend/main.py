from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db
from routers import tickets
import crud
import schemas

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Helpdesk Ticket Management System API",
    description="REST API for managing internal IT support tickets.",
    version="1.0.0",
)

# CORS Middleware — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(tickets.router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Helpdesk Ticket Management System API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/dashboard", response_model=schemas.DashboardStats, tags=["Dashboard"])
def dashboard_stats(db: Session = Depends(get_db)):
    """Returns aggregate stats for the dashboard."""
    return crud.get_dashboard_stats(db)


@app.get("/search", response_model=schemas.TicketListResponse, tags=["Search"])
def search_tickets(
    keyword: str = None,
    category: str = None,
    status: str = None,
    priority: str = None,
    db: Session = Depends(get_db),
):
    """Top-level search endpoint (mirrors /tickets/search)."""
    tickets_result = crud.search_tickets(db, keyword=keyword, category=category, status=status, priority=priority)
    return {"total": len(tickets_result), "tickets": tickets_result}
