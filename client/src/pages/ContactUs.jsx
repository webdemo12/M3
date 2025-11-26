import { useState } from "react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit form");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Contact Us
            </h3>
            <p className="text-muted">We'd love to hear from you. Send us a message!</p>
          </div>
        </div>

        {success && (
          <div className="success-animation" style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            color: "var(--color-success)",
            padding: "1rem",
            borderRadius: "0.375rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "slideInSuccess 0.5s ease-out"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>Thank you! We'll get back to you soon.</span>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "var(--color-danger)",
            padding: "1rem",
            borderRadius: "0.375rem",
            marginBottom: "1rem"
          }}>
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              data-testid="input-contact-name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              data-testid="input-contact-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 1234567890"
              data-testid="input-contact-phone" required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="form-input form-textarea"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message..."
              required
              style={{ minHeight: "150px" }}
              data-testid="textarea-contact-message"
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${loading ? "btn-sending" : ""}`}
            disabled={loading}
            data-testid="button-submit-contact"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      {/* Business Information */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <div className="card-header">
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Business Information</h3>
        </div>
        <div style={{ padding: "1rem" }}>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Business Hours</h4>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>Monday - Saturday: 9:00 AM - 11:00 PM</p>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>Sunday: 10:00 AM - 9:00 PM</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Phone Number</h4>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>+91 7085147119</p>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>+91 7629872420</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Email Address</h4>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>subrajitn0u@gmail.com</p>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>support@m3matka.com</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Address</h4>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}> chapadali</p>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>Barasat,west bengal,700125</p>
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>India</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
