import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    appName: "My Application",
    apiUrl: "https://api.example.com",
    enableLogging: true,
    enableCaching: true,
    sessionTimeout: "30",
    timezone: "UTC",
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // todo: replace with API call
    console.log("Settings saved:", settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="mb-lg">
        <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
          Settings
        </h3>
        <p className="text-muted">Configure your application settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="card-header">
            <div>
              <h4 className="card-title">General Settings</h4>
              <p className="card-description">Basic application configuration</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="appName">Application Name</label>
            <input
              type="text"
              id="appName"
              name="appName"
              className="form-input"
              value={settings.appName}
              onChange={handleChange}
              data-testid="input-app-name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="apiUrl">API URL</label>
            <input
              type="url"
              id="apiUrl"
              name="apiUrl"
              className="form-input font-mono"
              value={settings.apiUrl}
              onChange={handleChange}
              data-testid="input-api-url"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="timezone">Timezone</label>
            <select
              id="timezone"
              name="timezone"
              className="form-input form-select"
              value={settings.timezone}
              onChange={handleChange}
              data-testid="select-timezone"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="card-header">
            <div>
              <h4 className="card-title">Performance</h4>
              <p className="card-description">Optimize your application performance</p>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="enableLogging"
                checked={settings.enableLogging}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)" }}
                data-testid="checkbox-logging"
              />
              <div>
                <span style={{ fontWeight: 500 }}>Enable Logging</span>
                <p className="text-muted text-sm" style={{ marginTop: "0.25rem" }}>
                  Record application events and errors
                </p>
              </div>
            </label>
          </div>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="enableCaching"
                checked={settings.enableCaching}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", accentColor: "var(--color-primary)" }}
                data-testid="checkbox-caching"
              />
              <div>
                <span style={{ fontWeight: 500 }}>Enable Caching</span>
                <p className="text-muted text-sm" style={{ marginTop: "0.25rem" }}>
                  Cache API responses for better performance
                </p>
              </div>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sessionTimeout">Session Timeout (minutes)</label>
            <input
              type="number"
              id="sessionTimeout"
              name="sessionTimeout"
              className="form-input"
              value={settings.sessionTimeout}
              onChange={handleChange}
              min="5"
              max="1440"
              style={{ maxWidth: "200px" }}
              data-testid="input-session-timeout"
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="card-header">
            <div>
              <h4 className="card-title">Database Connection</h4>
              <p className="card-description">PostgreSQL connection details</p>
            </div>
          </div>

          <div className="code-block">
            <p style={{ color: "var(--color-muted-foreground)" }}># Environment Variables</p>
            <p>DATABASE_URL=postgresql://...</p>
            <p>PGHOST=localhost</p>
            <p>PGPORT=5432</p>
            <p>PGDATABASE=myapp</p>
            <p>PGUSER=postgres</p>
          </div>
          <p className="text-muted text-sm" style={{ marginTop: "1rem" }}>
            Database credentials are managed through environment variables for security.
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" data-testid="button-save-settings">
            Save Settings
          </button>
          {saved && (
            <span style={{ color: "var(--color-success)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
