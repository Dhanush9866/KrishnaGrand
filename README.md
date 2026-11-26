# Krishna Grand Luxury Rooms - Web Application

Full-stack web application with Node.js/Express backend and modern frontend for hotel reservations and management.

---

## 📁 Project Structure

```text
KrishnaGrand/
├── package.json             # Root NPM configuration with scripts & dependencies
├── package-lock.json        # Dependency lockfile
├── README.md                # Documentation & instructions
│
├── backend/                 # Backend Node.js / Express Server
│   ├── server.js            # Main Express application & static file server
│   ├── routes/
│   │   ├── rooms.js         # API route: /api/rooms (Room tariffs and data)
│   │   └── bookings.js      # API route: /api/bookings (Create, view, search reservations)
│   └── data/
│       └── bookings.json    # Persistent JSON storage for all customer bookings
│
└── frontend/                # Client-Side Assets
    ├── index.html           # Main landing and reservation page
    ├── styles.css           # Luxury hotel styling and responsive layout
    ├── app.js               # Frontend booking logic & API integration
    └── assets/              # Images, room photography, and hotel logo
```

---

## 🚀 How to Run

### **1. Start the Application**
In the project root (`E:\KrishnaGrand`), run:

```bash
npm start
```

For auto-reloading during development:
```bash
npm run dev
```

### **2. Open in Browser**
Visit:
```
http://localhost:5000
```

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/rooms` | Retrieve all room types, pricing, and specs |
| `GET` | `/api/rooms/:id` | Get details for specific room category |
| `GET` | `/api/bookings` | List all saved reservations |
| `GET` | `/api/bookings/search?q=QUERY` | Search booking by Booking ID or Guest Phone |
| `GET` | `/api/bookings/:id` | Lookup reservation by Booking ID |
| `POST` | `/api/bookings` | Create a new reservation and persist to database |
