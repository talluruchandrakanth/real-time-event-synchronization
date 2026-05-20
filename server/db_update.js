const path = require("path");
const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "chandu123",
  database: "event_engine"
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected to DB for updates.");
  const q1 = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`;
  const q2 = `ALTER TABLE events ADD COLUMN total_slots INT DEFAULT 100;`;
  const q3 = `CREATE TABLE IF NOT EXISTS registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
  );`;
  
  db.query(q1, err => {
    if (err) console.error("Error q1:", err.message);
    else console.log("Created users table");
    db.query(q2, err => {
      if (err) console.log("q2 note:", err.message); // might already exist
      else console.log("Added total_slots to events");
      db.query(q3, err => {
        if (err) console.error("Error q3:", err.message);
        else console.log("Created registrations table");
        console.log("DB update complete");
        process.exit();
      });
    });
  });
});
