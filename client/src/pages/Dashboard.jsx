import { useState, useEffect } from "react";
import StatsCard from "../components/StatsCard";
import DataTable from "../components/DataTable";

// todo: remove mock functionality
const mockStats = [
  {
    label: "Total Users",
    value: "1,234",
    trend: "positive",
    trendValue: "12% from last month",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: "Active Sessions",
    value: "342",
    trend: "positive",
    trendValue: "8% from yesterday",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    label: "Database Records",
    value: "45,678",
    trend: "positive",
    trendValue: "2,345 new this week",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
        <path d="M3 12A9 3 0 0 0 21 12"/>
      </svg>
    ),
  },
  {
    label: "API Calls",
    value: "89.2K",
    trend: "negative",
    trendValue: "-3% from last hour",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
  },
];

// todo: remove mock functionality
const mockActivity = [
  { id: 1, action: "User created", user: "john@example.com", timestamp: "2 minutes ago", status: "success" },
  { id: 2, action: "Database backup", user: "System", timestamp: "15 minutes ago", status: "success" },
  { id: 3, action: "API rate limit", user: "api@client.com", timestamp: "1 hour ago", status: "warning" },
  { id: 4, action: "Login failed", user: "unknown@test.com", timestamp: "2 hours ago", status: "error" },
  { id: 5, action: "Settings updated", user: "admin@example.com", timestamp: "3 hours ago", status: "success" },
];

const activityColumns = [
  { key: "action", label: "Action" },
  { key: "user", label: "User" },
  { key: "timestamp", label: "Time" },
  {
    key: "status",
    label: "Status",
    render: (value) => {
      const badgeClass = {
        success: "badge-success",
        warning: "badge-warning",
        error: "badge-danger",
      }[value] || "badge-default";
      return <span className={`badge ${badgeClass}`}>{value}</span>;
    },
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats);
  const [activity, setActivity] = useState(mockActivity);
  const [loading, setLoading] = useState(false);

  // todo: replace with actual API call
  useEffect(() => {
    setLoading(true);
    // Simulate API loading
    setTimeout(() => {
      setStats(mockStats);
      setActivity(mockActivity);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div>
      <div className="mb-lg">
        <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Welcome back!
        </h3>
        <p className="text-muted">Here's what's happening with your application today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h4 className="card-title">Recent Activity</h4>
            <p className="card-description">Latest actions across your application</p>
          </div>
          <button className="btn btn-secondary" data-testid="button-view-all">
            View All
          </button>
        </div>
        
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <DataTable columns={activityColumns} data={activity} />
        )}
      </div>
    </div>
  );
}
