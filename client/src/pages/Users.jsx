import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

const userColumns = [
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <span className={`badge ${value === "active" ? "badge-success" : "badge-default"}`}>
        {value}
      </span>
    ),
  },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "User",
    password: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        password: "",
      });
    } else {
      setEditingUser(null);
      setFormData({ username: "", email: "", role: "User", password: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ username: "", email: "", role: "User", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            role: formData.role,
          }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update user");
        }
      } else {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create user");
        }
      }
      
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving user:", err);
      alert(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete user");
        await fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        alert(err.message);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="card-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Users</h3>
          <p className="text-muted">Manage your application users</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
          data-testid="button-add-user"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
            <path d="M12 5v14"/>
          </svg>
          Add User
        </button>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input
            type="search"
            className="form-input"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-users"
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>{error}</p>
          <button className="btn btn-secondary" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      ) : (
        <DataTable
          columns={userColumns}
          data={filteredUsers}
          emptyMessage="No users found. Create your first user to get started."
          actions={(user) => (
            <>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => handleOpenModal(user)}
                data-testid={`button-edit-user-${user.id}`}
                aria-label="Edit user"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
              </button>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => handleDelete(user)}
                data-testid={`button-delete-user-${user.id}`}
                aria-label="Delete user"
                style={{ color: "var(--color-danger)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </>
          )}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? "Edit User" : "Create User"}
        footer={
          <>
            <button className="btn btn-secondary" onClick={handleCloseModal} data-testid="button-cancel">
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} data-testid="button-save-user">
              {editingUser ? "Save Changes" : "Create User"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
              data-testid="input-username"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              data-testid="input-email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              className="form-input form-select"
              value={formData.role}
              onChange={handleInputChange}
              data-testid="select-role"
            >
              <option value="User">User</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          
          {!editingUser && (
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                required={!editingUser}
                data-testid="input-password"
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
