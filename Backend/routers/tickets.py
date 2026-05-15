from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import crud
import schemas

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("", response_model=schemas.TicketListResponse)
def get_all_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve all tickets with optional pagination."""
    tickets = crud.get_all_tickets(db, skip=skip, limit=limit)
    return {"total": len(tickets), "tickets": tickets}


@router.get("/search", response_model=schemas.TicketListResponse)
def search_tickets(
    keyword: Optional[str] = Query(None, description="Search keyword"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    db: Session = Depends(get_db),
):
    """Search and filter tickets by keyword, category, status, or priority."""
    tickets = crud.search_tickets(db, keyword=keyword, category=category, status=status, priority=priority)
    return {"total": len(tickets), "tickets": tickets}


@router.get("/{ticket_id}", response_model=schemas.TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Retrieve a single ticket by ID."""
    ticket = crud.get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket with ID {ticket_id} not found.")
    return ticket


@router.post("", response_model=schemas.TicketResponse, status_code=201)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    """Create a new support ticket."""
    return crud.create_ticket(db, ticket)


@router.put("/{ticket_id}", response_model=schemas.TicketResponse)
def update_ticket(ticket_id: int, ticket_update: schemas.TicketUpdate, db: Session = Depends(get_db)):
    """Update an existing ticket by ID."""
    updated = crud.update_ticket(db, ticket_id, ticket_update)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Ticket with ID {ticket_id} not found.")
    return updated


@router.delete("/{ticket_id}", status_code=200)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """Delete a ticket by ID."""
    success = crud.delete_ticket(db, ticket_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Ticket with ID {ticket_id} not found.")
    return {"message": f"Ticket {ticket_id} deleted successfully."}
