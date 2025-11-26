import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Modal from "../components/Modal";

const TIME_SLOTS = [
  "10:30 AM", "12:00 PM", "01:30 PM", "03:00 PM", 
  "04:30 PM", "06:00 PM", "07:30 PM", "09:00 PM"
];

export default function Admin() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("results");
  const [subTab, setSubTab] = useState("today");
  const [results, setResults] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [formData, setFormData] = useState({
    result_date: new Date().toISOString().split('T')[0],
    time_slot: "",
    number_1: "",
    number_2: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Helper function to extract date portion (handles both string and Date formats)
  const getDateString = (dateValue) => {
    if (typeof dateValue === 'string') {
      return dateValue.split('T')[0];
    }
    return new Date(dateValue).toISOString().split('T')[0];
  };
  
  const todayDate = new Date().toISOString().split('T')[0];
  const todayResults = results.filter(r => getDateString(r.result_date) === todayDate);
  const previousResults = results.filter(r => getDateString(r.result_date) !== todayDate);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resultsRes, contactsRes] = await Promise.all([
        fetch("/api/results/recent").then(r => r.json()),
        fetch("/api/contact").then(r => r.json())
      ]);
      setResults(resultsRes);
      setContacts(contactsRes);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (result = null) => {
    if (result) {
      setEditingResult(result);
      setFormData({
        result_date: result.result_date,
        time_slot: result.time_slot,
        number_1: result.number_1.toString(),
        number_2: result.number_2.toString(),
      });
    } else {
      setEditingResult(null);
      setFormData({
        result_date: new Date().toISOString().split('T')[0],
        time_slot: "",
        number_1: "",
        number_2: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = editingResult ? "POST" : "POST";
      const response = await fetch("/api/results", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          number_1: parseInt(formData.number_1),
          number_2: parseInt(formData.number_2),
        }),
      });

      if (!response.ok) throw new Error("Failed to save result");
      
      await fetchData();
      handleCloseModal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result?")) return;
    
    try {
      const response = await fetch(`/api/results/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setLocation("/");
    } catch (err) {
      alert("Logout failed: " + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to change password");
      
      alert("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setIsPasswordModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`btn ${activeTab === "results" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveTab("results")}
            style={{ borderBottom: activeTab === "results" ? "2px solid var(--color-primary)" : "none" }}
            data-testid="tab-results"
          >
            Manage Results (Last 10 Days)
          </button>
          <button
            className={`btn ${activeTab === "contacts" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveTab("contacts")}
            style={{ borderBottom: activeTab === "contacts" ? "2px solid var(--color-primary)" : "none" }}
            data-testid="tab-contacts"
          >
            Contact Submissions
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="btn btn-ghost"
            onClick={() => setIsPasswordModalOpen(true)}
            data-testid="button-change-password"
          >
            Change Password
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            Logout
          </button>
        </div>
      </div>

      {activeTab === "results" && (
        <div>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <button
              className={`btn ${subTab === "today" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setSubTab("today")}
              style={{ borderBottom: subTab === "today" ? "2px solid var(--color-primary)" : "none" }}
              data-testid="tab-today"
            >
              Today's Results
            </button>
            <button
              className={`btn ${subTab === "previous" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setSubTab("previous")}
              style={{ borderBottom: subTab === "previous" ? "2px solid var(--color-primary)" : "none" }}
              data-testid="tab-previous"
            >
              Previous Results
            </button>
          </div>

          <div className="card" style={{ marginBottom: "2rem" }}>
            <div className="card-header">
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                {subTab === "today" ? "Today's Results" : "Previous Results"}
              </h3>
              {subTab === "today" && (
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenModal()}
                  data-testid="button-add-result"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="M12 5v14"/>
                  </svg>
                  Add Result
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <div className="spinner"></div>
              </div>
            ) : (subTab === "today" ? todayResults.length === 0 : previousResults.length === 0) ? (
              <p style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted-foreground)" }}>
                No {subTab === "today" ? "today's" : "previous"} results yet
              </p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>pati</th>
                      <th>ghar</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(subTab === "today" ? todayResults : previousResults).map((result) => (
                      <tr key={result.id} data-testid={`result-row-${result.id}`}>
                        <td>{getDateString(result.result_date)}</td>
                        <td>{result.time_slot}</td>
                        <td style={{ fontWeight: 600, fontSize: "1.1rem" }}>{result.number_1}</td>
                        <td style={{ fontWeight: 600, fontSize: "1.1rem" }}>{result.number_2}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => handleOpenModal(result)}
                            data-testid={`button-edit-result-${result.id}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            </svg>
                          </button>
                          <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => handleDelete(result.id)}
                            data-testid={`button-delete-result-${result.id}`}
                            style={{ color: "var(--color-danger)" }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Contact Submissions</h3>
            <span className="badge badge-default">{contacts.length}</span>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <div className="spinner"></div>
            </div>
          ) : contacts.length === 0 ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "var(--color-muted-foreground)" }}>
              No contact submissions yet
            </p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ minWidth: "150px" }}>Name</th>
                    <th style={{ minWidth: "180px" }}>Email</th>
                    <th style={{ minWidth: "120px" }}>Phone</th>
                    <th style={{ minWidth: "300px" }}>Message</th>
                    <th style={{ minWidth: "100px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} data-testid={`contact-row-${contact.id}`}>
                      <td style={{ minWidth: "150px", wordBreak: "break-word" }}>{contact.name}</td>
                      <td style={{ minWidth: "180px", wordBreak: "break-word" }}>{contact.email}</td>
                      <td style={{ minWidth: "120px" }}>{contact.phone || "-"}</td>
                      <td style={{ minWidth: "300px", wordBreak: "break-word" }}>
                        {contact.message}
                      </td>
                      <td className="text-sm text-muted" style={{ minWidth: "100px" }}>
                        {new Date(contact.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        }}
        title="Change Password"
        footer={
          <>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setIsPasswordModalOpen(false);
                setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
              }}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleChangePassword}>Change Password</button>
          </>
        }
      >
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label" htmlFor="old-password">Current Password</label>
            <input
              type="password"
              id="old-password"
              name="oldPassword"
              className="form-input"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              required
              data-testid="input-old-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              name="newPassword"
              className="form-input"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              data-testid="input-new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              className="form-input"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              data-testid="input-confirm-password"
            />
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingResult ? "Edit Result" : "Add Result"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="result_date"
              className="form-input"
              value={formData.result_date}
              onChange={handleChange}
              required
              data-testid="input-result-date"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="slot">Time Slot</label>
            <select
              id="slot"
              name="time_slot"
              className="form-input form-select"
              value={formData.time_slot}
              onChange={handleChange}
              required
              data-testid="select-time-slot"
            >
              <option value="">Select time slot</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="num1">pati</label>
              <input
                type="number"
                id="num1"
                name="number_1"
                className="form-input"
                value={formData.number_1}
                onChange={handleChange}
                min="0"
                max="99"
                required
                data-testid="input-number-1"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="num2">ghar</label>
              <input
                type="number"
                id="num2"
                name="number_2"
                className="form-input"
                value={formData.number_2}
                onChange={handleChange}
                min="0"
                max="99"
                required
                data-testid="input-number-2"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
