import React from "react";

const STATUS_MAP = {
  "Open":        { color: "blue",   icon: "◉" },
  "In Progress": { color: "yellow", icon: "◷" },
  "Resolved":    { color: "green",  icon: "✓" },
  "Closed":      { color: "dim",    icon: "✕" },
};

const PRIORITY_MAP = {
  "Low":      { color: "blue",   icon: "↓" },
  "Medium":   { color: "yellow", icon: "→" },
  "High":     { color: "orange", icon: "↑" },
  "Critical": { color: "red",    icon: "!" },
};

export function StatusBadge({ value }) {
  const info = STATUS_MAP[value] || { color: "dim", icon: "?" };
  return (
    <span className={`badge badge-${info.color}`}>
      <span className="badge-icon">{info.icon}</span>
      {value}
    </span>
  );
}

export function PriorityBadge({ value }) {
  const info = PRIORITY_MAP[value] || { color: "dim", icon: "?" };
  return (
    <span className={`badge badge-${info.color}`}>
      <span className="badge-icon">{info.icon}</span>
      {value}
    </span>
  );
}
