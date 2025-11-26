import { useState, useEffect } from "react";
import ResultsTable from "../components/ResultsTable";
import ganeshImage from "@assets/stock_images/ganesh_lord_hindu_de_92be9c26.jpg";

export default function Home() {
  const [todayResults, setTodayResults] = useState([]);
  const [previousResults, setPreviousResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const [today, previous] = await Promise.all([
          fetch("/api/results/today").then(r => r.json()),
          fetch("/api/results/previous").then(r => r.json())
        ]);
        setTodayResults(today);
        setPreviousResults(previous);
        setError(null);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div style={{ zoom: 1, WebkitTextSizeAdjust: "100%", msTextSizeAdjust: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
        <img 
          src={ganeshImage} 
          alt="Ganesh" 
          style={{
            maxWidth: "200px",
            height: "auto",
            borderRadius: "8px",
            display: "block"
          }}
          data-testid="image-ganesh"
        />
      </div>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <div className="live-badge">
          <div className="live-dot" data-testid="live-dot"></div>
          <span>LIVE</span>
        </div>
      </div>

      <div className="card fade-in-up" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Today's Results</h3>
            <p className="text-muted">Live Result Original Website </p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <p style={{ color: "var(--color-danger)" }}>Error loading results: {error}</p>
        ) : todayResults.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted-foreground)" }}>
            No results available for today
          </div>
        ) : (
          <ResultsTable results={todayResults} />
        )}
      </div>

      <div className="card fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Previous Results</h3>
            <p className="text-muted">Last 15 days</p>
          </div>
        </div>

        {previousResults.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted-foreground)" }}>
            No previous results
          </div>
        ) : (
          <ResultsTable results={previousResults.slice(0, 120)} />
        )}
      </div>
    </div>
  );
}
