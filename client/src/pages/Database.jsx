import { useState } from "react";
import StatsCard from "../components/StatsCard";

// todo: remove mock functionality
const mockTables = [
  { name: "users", rows: 1234, size: "2.4 MB", lastModified: "2 hours ago" },
  { name: "sessions", rows: 342, size: "156 KB", lastModified: "5 minutes ago" },
  { name: "posts", rows: 8765, size: "12.8 MB", lastModified: "1 hour ago" },
  { name: "comments", rows: 23456, size: "8.2 MB", lastModified: "30 minutes ago" },
  { name: "settings", rows: 45, size: "12 KB", lastModified: "3 days ago" },
];

export default function Database() {
  const [tables] = useState(mockTables);
  const [selectedTable, setSelectedTable] = useState(null);
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10;");

  const handleRunQuery = () => {
    console.log("Running query:", query);
    // todo: implement actual query execution
    alert("Query executed! Check console for details.");
  };

  const totalRows = tables.reduce((sum, t) => sum + t.rows, 0);
  const totalSize = "23.6 MB"; // todo: calculate dynamically

  return (
    <div>
      <div className="mb-lg">
        <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Database
        </h3>
        <p className="text-muted">View and manage your PostgreSQL database</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <StatsCard
          label="Total Tables"
          value={tables.length}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <path d="M3 9h18"/>
              <path d="M9 21V9"/>
            </svg>
          }
        />
        <StatsCard
          label="Total Rows"
          value={totalRows.toLocaleString()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3z"/>
              <path d="M3 9h18"/>
              <path d="M3 15h18"/>
            </svg>
          }
        />
        <StatsCard
          label="Database Size"
          value={totalSize}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
              <path d="M3 12A9 3 0 0 0 21 12"/>
            </svg>
          }
        />
        <StatsCard
          label="Connection Status"
          value="Active"
          trend="positive"
          trendValue="Connected"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          }
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Tables</h4>
          </div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {tables.map((table) => (
              <div
                key={table.name}
                className={`nav-link ${selectedTable === table.name ? "active" : ""}`}
                onClick={() => setSelectedTable(table.name)}
                style={{ cursor: "pointer", marginBottom: "0.25rem" }}
                data-testid={`table-${table.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
                <span style={{ flex: 1 }}>{table.name}</span>
                <span className="text-muted text-xs">{table.rows.toLocaleString()} rows</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Query Editor</h4>
            <button className="btn btn-primary" onClick={handleRunQuery} data-testid="button-run-query">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Run
            </button>
          </div>
          <textarea
            className="form-input form-textarea font-mono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter SQL query..."
            style={{ minHeight: "200px", fontSize: "0.875rem" }}
            data-testid="textarea-query"
          />
        </div>
      </div>

      {selectedTable && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <div>
              <h4 className="card-title">Table: {selectedTable}</h4>
              <p className="card-description">
                {tables.find((t) => t.name === selectedTable)?.rows.toLocaleString()} rows, 
                {" "}{tables.find((t) => t.name === selectedTable)?.size}
              </p>
            </div>
          </div>
          <div className="code-block">
            <p style={{ marginBottom: "0.5rem", color: "var(--color-muted-foreground)" }}>-- Schema</p>
            <p>CREATE TABLE {selectedTable} (</p>
            <p style={{ paddingLeft: "1rem" }}>id SERIAL PRIMARY KEY,</p>
            <p style={{ paddingLeft: "1rem" }}>created_at TIMESTAMP DEFAULT NOW(),</p>
            <p style={{ paddingLeft: "1rem" }}>updated_at TIMESTAMP DEFAULT NOW()</p>
            <p>);</p>
          </div>
        </div>
      )}
    </div>
  );
}
