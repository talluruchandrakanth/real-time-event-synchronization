# 🎯 RealTimeEventSync

A full-stack **Real-Time Event Management Web Application** built with Node.js, Express, and MySQL. Authenticated users can create, manage, and monitor events with live status tracking and a responsive dashboard.

---

## 📸 Preview

> Dashboard with real-time event listing, status badges, and event creation form.

---

## ✨ Features

- 🔐 **Session-based Authentication** — Secure login with 24-hour session expiry
- 📅 **Event Management** — Create, view, and delete Live or Scheduled events
- 🟢 **Live Status Indicators** — Animated badges for real-time event status display
- 🎟️ **Event Details Tracking** — Name, type, location, date/time, ticket price, and slot count
- 🔄 **Real-Time Refresh** — Instant event list updates without page reload
- 🛡️ **Protected Routes** — Dashboard accessible only to authenticated users
- 📱 **Responsive UI** — Works across desktop and mobile browsers

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js v5.2.1 |
| **Database** | MySQL (via MySQL2 v3.19.1) |
| **Auth** | Express-Session v1.19.0 |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **API** | Fetch API (REST) |
| **CORS** | cors v2.8.6 |

---

## 📁 Project Structure

RealTimeEventSync_Project/
├── server/
│   ├── server.js           # Main Express server & API routes
│   ├── db_update.js        # Database operations
│   └── package.json        # Server dependencies
├── database/
│   └── schema.sql          # MySQL schema (users, events, registrations)
├── public/                 # Served to unauthenticated users
│   ├── home.html
│   ├── login.html
│   ├── create-account.html
│   ├── events.html
│   ├── app.js              # Client-side logic & API calls
│   └── style.css
├── private/                # Protected — authenticated users only
│   └── index.html          # Event organizer dashboard
├── package.json
└── db_update.js


---

## 🗄️ Database Schema

Three relational tables power the application:

**`users`** — Stores account information
```sql
id | name | email | password | created_at
```

**`events`** — Stores event details
```sql
event_id | event_name | event_type | event_location | event_date
ticket_price | event_status | total_slots | created_at
```

**`registrations`** — Links users to events
```sql
id | user_id (FK) | event_id (FK) | registered_at
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Home or Dashboard (based on session) | ❌ |
| `POST` | `/login` | Authenticate user | ❌ |
| `GET` | `/logout` | Destroy session & redirect | ✅ |
| `GET` | `/events` | Fetch all events | ✅ |
| `POST` | `/addEvent` | Create a new event | ✅ |
| `DELETE` | `/deleteEvent/:id` | Delete an event by ID | ✅ |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14+
- [MySQL](https://www.mysql.com/) v8+

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/RealTimeEventSync.git
cd RealTimeEventSync
```

### 2. Set Up the Database

Open MySQL and run the schema:

```bash
mysql -u root -p < database/schema.sql
```

### 3. Install Dependencies

```bash
# Root dependencies
npm install

# Server dependencies
cd server
npm install
```

### 4. Configure Environment

Update database credentials in `server/server.js` or create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_engine
SESSION_SECRET=your_secret_key
```

### 5. Start the Server

```bash
cd server
node server.js
```

Visit `http://localhost:3000` in your browser.

---

## 🔐 Default Login Credentials

```
Username: admin
Password: 1234
```

> ⚠️ Change these credentials before deploying to production.

---

## 🔭 Roadmap

- [ ] User registration with email verification
- [ ] WebSocket integration for true real-time push updates
- [ ] Event filtering by type, date, or status
- [ ] Ticket booking and registration management
- [ ] Admin panel for user management
- [ ] Deployment to cloud (AWS / Railway / Render)

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.

```bash
git checkout -b feature/your-feature-name
git commit -m "Add your feature"
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Tallu**  
📍 Tirupati, Andhra Pradesh, India  
🔗 [GitHub Profile](https://github.com/YOUR_USERNAME)

---

> Built with ❤️ using Node.js + Express + MySQL
