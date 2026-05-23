import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const NAV_LINKS = [
  { path: "/", label: "Dashboard", icon: "⬡" },
  { path: "/tickets", label: "All Tickets", icon: "≡" },
  { path: "/create", label: "New Ticket", icon: "+" },
  { path: "/search", label: "Search", icon: "◎" },
  { path: "/analytics", label: "Analytics", icon: "◈" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">▣</span>
        <div>
          <div className="brand-title">HDMS</div>
          <div className="brand-sub">Helpdesk System</div>
        </div>
      </div>
      <ul className="navbar-links">
        {NAV_LINKS.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className={`nav-link ${pathname === link.path ? "active" : ""}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="navbar-footer">
        <div className="status-dot" />
        <span>API Connected</span>
      </div>
    </nav>
  );
}
