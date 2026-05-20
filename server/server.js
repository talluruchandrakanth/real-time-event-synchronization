const path = require("path");
const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");

const app = express();

// 1. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Session Configuration (Optimized for Localhost)
app.use(session({
  secret: "event-engine-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Must be false for localhost (no HTTPS)
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// 3. Static Files
// Only serve CSS/JS from public. Do NOT serve index.html via static.
app.use("/public", express.static(path.join(__dirname, "../public")));

// 4. Root Route logic
app.get("/", (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  console.log("Checking session for user:", req.session.user, "Role:", req.session.role);

  if (req.session.user) {
    if (req.session.role === "admin") {
       // Only admins get the event organizer dashboard
       res.sendFile(path.join(__dirname, "../private/index.html"));
    } else {
       // Regular users get redirected to the events list to enroll
       res.redirect("/list-events");
    }
  } else {
    // If not logged in, send the home page
    res.sendFile(path.join(__dirname, "../public/home.html"));
  }
});

// Route for public events list
app.get("/list-events", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/events.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// 5. Login Route
app.post("/admin", (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt for:", username);

  if (username === "admin" && password === "1234") {
    req.session.user = username;
    req.session.role = "admin";

    // Crucial: Save the session before sending the response
    req.session.save((err) => {
      if (err) {
        console.error("Session Save Error:", err);
        return res.status(500).json({ success: false });
      }
      console.log("Session saved successfully for:", username);
      res.json({ success: true, role: "admin" });
    });
  } else {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
      if (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, message: "Database Error" });
      }

      if (results.length > 0) {
        req.session.user = results[0].name;
        req.session.userId = results[0].id;
        req.session.role = "user";
        
        req.session.save((err) => {
          if (err) return res.status(500).json({ success: false });
          res.json({ success: true, role: "user" });
        });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    });
  }
});

// 6. Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// 7. Database Connection (Make sure your details are correct)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "chandu123",
  database: "event_engine"
});

db.connect(err => {
  if (err) console.error("DB Connection Error:", err.message);
  else console.log("MySQL Connected");
});

// 8. API Routes (Protected)
app.get("/events", (req, res) => {
  const sql = `
    SELECT e.*, 
           (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) AS registered_count 
    FROM events e 
    ORDER BY e.event_date ASC
  `;
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});

app.post("/addEvent", (req, res) => {
  if (!req.session.user || req.session.user !== "admin") return res.status(401).send("Unauthorized");

  const { name, type, location, date, price, status, total_slots } = req.body;
  const slots = total_slots || 100;
  const sql = "INSERT INTO events (event_name, event_type, event_location, event_date, ticket_price, event_status, total_slots) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.query(sql, [name, type, location, date, price, status, slots], (err, result) => {
    if (err) {
      console.error("Add Event Error:", err);
      return res.status(500).send(err);
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.delete("/deleteEvent/:id", (req, res) => {
  if (!req.session.user || req.session.user !== "admin") return res.status(401).send("Unauthorized");

  const sql = "DELETE FROM events WHERE event_id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("Delete Event Error:", err);
      return res.status(500).send(err);
    }
    res.json({ success: true });
  });
});

// New Routes for User Config
app.post("/api/register-user", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: "Missing fields" });

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, message: "Account created successfully" });
  });
});

app.get("/api/user-status", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user, role: req.session.role });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post("/api/register-event", (req, res) => {
  if (!req.session.user || req.session.role !== 'user') {
    return res.status(401).json({ success: false, message: "Please log in as a user to register for events." });
  }

  const { event_id } = req.body;
  const user_id = req.session.userId;

  // Check if already registered
  db.query("SELECT * FROM registrations WHERE user_id = ? AND event_id = ?", [user_id, event_id], (err, results) => {
    if (results && results.length > 0) {
      return res.status(400).json({ success: false, message: "You are already registered for this event." });
    }

    // Check slots
    const checkSlotsSql = `
      SELECT e.total_slots, (SELECT COUNT(*) FROM registrations r WHERE r.event_id = ?) AS registered_count
      FROM events e WHERE e.event_id = ?
    `;
    db.query(checkSlotsSql, [event_id, event_id], (err, rows) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      if (rows.length === 0) return res.status(404).json({ success: false, message: "Event not found" });

      const { total_slots, registered_count } = rows[0];
      if (registered_count >= total_slots) {
        return res.status(400).json({ success: false, message: "Event is fully booked!" });
      }

      // Proceed to register
      db.query("INSERT INTO registrations (user_id, event_id) VALUES (?, ?)", [user_id, event_id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to register" });
        res.json({ success: true, message: "Successfully registered to the event!" });
      });
    });
  });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});