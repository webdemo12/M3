import { useState } from "react";
import ResultsTable from "../components/ResultsTable";

export default function PreviousResults() {
  const [searchDate, setSearchDate] = useState("");
  const [searchNumber, setSearchNumber] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchDate && !searchNumber) {
      alert("Please enter a date or number to search");
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchDate) params.append("date", searchDate);
      if (searchNumber) params.append("number", searchNumber);

      const response = await fetch(`/api/results/search?${params}`);
      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      setResults(data);
      setError(null);
    } catch (err) {
      console.error("Error searching results:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchDate("");
    setSearchNumber("");
    setResults([]);
    setError(null);
  };

  const [allPreviousResults, setAllPreviousResults] = useState([]);

  const loadAllPreviousResults = async () => {
    try {
      const response = await fetch("/api/results/previous");
      if (!response.ok) throw new Error("Failed to load results");
      const data = await response.json();
      setAllPreviousResults(data.slice(0, 240));
    } catch (err) {
      console.error("Error loading previous results:", err);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Search Results</h3>
        </div>

        <form onSubmit={handleSearch}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="date">Search by Date</label>
              <input
                type="date"
                id="date"
                className="form-input"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                data-testid="input-search-date"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="number">Search by Number</label>
              <input
                type="number"
                id="number"
                className="form-input"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                placeholder="Enter number"
                data-testid="input-search-number"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" data-testid="button-search">
              Search
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset} data-testid="button-reset">
              Reset
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: "2rem", padding: "1rem" }}>
          <p style={{ color: "var(--color-danger)" }}>Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <div className="spinner"></div>
        </div>
      ) : results.length > 0 ? (
        <div className="card">
          <div className="card-header">
            <p className="text-muted">{results.length} result(s) found</p>
          </div>
          <ResultsTable results={results} />
        </div>
      ) : null}

      {!searchDate && !searchNumber && allPreviousResults.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button 
            onClick={loadAllPreviousResults}
            className="btn btn-primary"
            style={{ marginBottom: "2rem" }}
          >
            Load Last 30 Days Results
          </button>
        </div>
      )}

      {allPreviousResults.length > 0 && !searchDate && !searchNumber && (
        <div className="card fade-in-up">
          <div className="card-header">
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Previous 30 Days</h3>
            <p className="text-muted">{allPreviousResults.length} results</p>
          </div>
          <ResultsTable results={allPreviousResults} />
        </div>
      )}
    </div>
  );
}
