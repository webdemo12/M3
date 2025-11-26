import { createServer } from "http";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("Executed query", { text: text.substring(0, 50), duration, rows: result.rowCount });
  return result;
}

async function initDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        result_date DATE NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        number_1 INT NOT NULL,
        number_2 INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(result_date, time_slot)
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default admin user if none exists
    const adminCheck = await query("SELECT COUNT(*) as count FROM admin_users");
    if (parseInt(adminCheck.rows[0].count) === 0) {
      await query(
        "INSERT INTO admin_users (username, password) VALUES ($1, $2)",
        ["admin", "admin123"]
      );
      console.log("Default admin user created (username: admin, password: admin123)");
    }
    
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

export async function registerRoutes(app) {
  // Initialize database
  await initDatabase();

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // GET today's results
  app.get("/api/results/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await query(
        "SELECT id, result_date, time_slot, number_1, number_2 FROM results WHERE result_date = $1 ORDER BY time_slot",
        [today]
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching today's results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // GET previous results (last 15 days)
  app.get("/api/results/previous", async (req, res) => {
    try {
      const result = await query(
        "SELECT id, result_date, time_slot, number_1, number_2 FROM results WHERE result_date < CURRENT_DATE ORDER BY result_date DESC, time_slot LIMIT 120"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching previous results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // GET recent results (last 10 days including today)
  app.get("/api/results/recent", async (req, res) => {
    try {
      const result = await query(
        "SELECT id, result_date, time_slot, number_1, number_2 FROM results WHERE result_date >= CURRENT_DATE - INTERVAL '9 days' ORDER BY result_date DESC, time_slot"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching recent results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Search results
  app.get("/api/results/search", async (req, res) => {
    try {
      const { date, number } = req.query;
      let queryStr = "SELECT id, result_date, time_slot, number_1, number_2 FROM results WHERE 1=1";
      const params = [];

      if (date) {
        const dateStr = Array.isArray(date) ? date[0] : date;
        queryStr += " AND result_date = $" + (params.length + 1);
        params.push(dateStr);
      }

      if (number) {
        const numberStr = Array.isArray(number) ? number[0] : number;
        queryStr += " AND (number_1 = $" + (params.length + 1) + " OR number_2 = $" + (params.length + 1) + ")";
        params.push(parseInt(numberStr));
      }

      queryStr += " ORDER BY result_date DESC, time_slot";
      const result = await query(queryStr, params);
      res.json(result.rows);
    } catch (error) {
      console.error("Error searching results:", error);
      res.status(500).json({ error: "Failed to search results" });
    }
  });

  // POST result
  app.post("/api/results", async (req, res) => {
    try {
      const { result_date, time_slot, number_1, number_2 } = req.body;
      
      if (!result_date || !time_slot || !number_1 || !number_2) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const result = await query(
        "INSERT INTO results (result_date, time_slot, number_1, number_2) VALUES ($1, $2, $3, $4) ON CONFLICT(result_date, time_slot) DO UPDATE SET number_1=$3, number_2=$4 RETURNING id, result_date, time_slot, number_1, number_2",
        [result_date, time_slot, number_1, number_2]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating result:", error);
      res.status(500).json({ error: "Failed to create result" });
    }
  });

  // DELETE result
  app.delete("/api/results/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await query("DELETE FROM results WHERE id = $1 RETURNING id", [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Result not found" });
      }

      res.json({ message: "Result deleted successfully" });
    } catch (error) {
      console.error("Error deleting result:", error);
      res.status(500).json({ error: "Failed to delete result" });
    }
  });

  // POST contact submission
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }

      const result = await query(
        "INSERT INTO contact_submissions (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone, message, created_at",
        [name, email, phone || null, message]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating contact submission:", error);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // GET all contact submissions
  app.get("/api/contact", async (req, res) => {
    try {
      const result = await query(
        "SELECT id, name, email, phone, message, created_at FROM contact_submissions ORDER BY created_at DESC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const result = await query(
        "SELECT id, username FROM admin_users WHERE username = $1 AND password = $2",
        [username, password]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const admin = result.rows[0];
      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        res.json({ message: "Login successful", admin });
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Check admin session
  app.get("/api/admin/check", (req, res) => {
    if (req.session?.adminId) {
      res.json({ isAdmin: true, username: req.session.adminUsername });
    } else {
      res.json({ isAdmin: false });
    }
  });

  // Change admin password
  app.post("/api/admin/change-password", async (req, res) => {
    try {
      if (!req.session?.adminId) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const { oldPassword, newPassword } = req.body;
      
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Both passwords are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      const checkResult = await query(
        "SELECT id FROM admin_users WHERE id = $1 AND password = $2",
        [req.session.adminId, oldPassword]
      );

      if (checkResult.rows.length === 0) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      await query(
        "UPDATE admin_users SET password = $1 WHERE id = $2",
        [newPassword, req.session.adminId]
      );

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
