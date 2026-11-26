const express = require('express');
const path = require('path');
const cors = require('cors');

const roomsRouter = require('./routes/rooms');
const bookingsRouter = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to index.html for any unhandled routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🏨 KRISHNA GRAND LUXURY ROOMS - SERVER STARTED`);
    console.log(`🚀 Access application: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints:`);
    console.log(`   - Rooms:    http://localhost:${PORT}/api/rooms`);
    console.log(`   - Bookings: http://localhost:${PORT}/api/bookings`);
    console.log('====================================================');
});

module.exports = app;
