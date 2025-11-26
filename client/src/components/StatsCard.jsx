export default function StatsCard({ label, value, trend, trendValue, icon }) {
  return (
    <div className="stat-card" data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-icon">{icon}</span>
      </div>
      <div className="stat-card-value">{value}</div>
      {trend && (
        <div className={`stat-card-trend ${trend}`}>
          {trend === "positive" ? "+" : ""}{trendValue}
        </div>
      )}
    </div>
  );
}
