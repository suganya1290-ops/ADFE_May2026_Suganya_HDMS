from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class PriorityEnum(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"
    critical = "Critical"


class StatusEnum(str, Enum):
    open = "Open"
    in_progress = "In Progress"
    resolved = "Resolved"
    closed = "Closed"


class IssueCategoryEnum(str, Enum):
    vpn = "VPN Issue"
    password = "Password Reset"
    software = "Software Installation"
    laptop = "Laptop Issue"
    email = "Email Access"
    network = "Network Connectivity"
    hardware = "Hardware Request"


# --- Request Schemas ---

class TicketCreate(BaseModel):
    employee_name: str = Field(..., min_length=2, max_length=100)
    department: str = Field(..., min_length=2, max_length=100)
    issue_category: IssueCategoryEnum
    description: str = Field(..., min_length=10)
    priority: PriorityEnum = PriorityEnum.medium


class TicketUpdate(BaseModel):
    employee_name: Optional[str] = Field(None, min_length=2, max_length=100)
    department: Optional[str] = Field(None, min_length=2, max_length=100)
    issue_category: Optional[IssueCategoryEnum] = None
    description: Optional[str] = Field(None, min_length=10)
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None
    resolution_notes: Optional[str] = None


# --- Response Schemas ---

class TicketResponse(BaseModel):
    ticket_id: int
    employee_name: str
    department: str
    issue_category: str
    description: str
    priority: str
    status: str
    resolution_notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    total: int
    tickets: list[TicketResponse]


class DashboardStats(BaseModel):
    total: int
    open: int
    in_progress: int
    resolved: int
    closed: int
    critical: int
    high: int
