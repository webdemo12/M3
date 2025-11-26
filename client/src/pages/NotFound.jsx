import { Link } from "wouter";

export default function NotFound() {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      minHeight: "60vh",
      textAlign: "center",
      padding: "2rem"
    }}>
      <h1 style={{ fontSize: "6rem", fontWeight: 700, color: "var(--color-muted-foreground)", marginBottom: "1rem" }}>
        404
      </h1>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Page Not Found
      </h2>
      <p className="text-muted" style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="btn btn-primary" data-testid="link-go-home">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7"/>
          <path d="M19 12H5"/>
        </svg>
        Go Home
      </Link>
    </div>
  );
}
