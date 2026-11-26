const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '../data/bookings.json');

// Helper to read bookings from JSON file
function readBookings() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]', 'utf8');
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Error reading bookings:', err);
        return [];
    }
}

// Helper to write bookings to JSON file
function writeBookings(bookings) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing bookings:', err);
    }
}

// GET /api/bookings/search?q=... - Search booking by ID or phone number
router.get('/search', (req, res) => {
    const query = (req.query.q || '').trim().toLowerCase();
    if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const bookings = readBookings();
    const found = bookings.find(b =>
        (b.bookingId && b.bookingId.toLowerCase() === query) ||
        (b.guestPhone && b.guestPhone.includes(query))
    );

    if (found) {
        return res.json({ success: true, data: found });
    }

    return res.status(404).json({ success: false, message: `No active booking found matching "${query}".` });
});

// GET /api/bookings - Get all bookings
router.get('/', (req, res) => {
    const bookings = readBookings();
    res.json({ success: true, count: bookings.length, data: bookings });
});

// GET /api/bookings/:id - Get a specific booking by ID
router.get('/:id', (req, res) => {
    const id = req.params.id.trim().toUpperCase();
    const bookings = readBookings();
    const booking = bookings.find(b => b.bookingId === id);

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: booking });
});

// POST /api/bookings - Create a new booking
router.post('/', (req, res) => {
    const {
        guestName,
        guestPhone,
        guestAddress,
        idProof,
        idProofNumber,
        checkInDate,
        checkInTime,
        roomKey,
        roomName,
        guestsCount,
        roomsCount,
        specialRequests,
        totalPrice
    } = req.body;

    if (!guestName || !guestPhone) {
        return res.status(400).json({
            success: false,
            message: 'Guest full name and mobile number are required.'
        });
    }

    const bookingId = 'KG-' + Math.floor(100000 + Math.random() * 900000);
    const createdDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const newBooking = {
        bookingId,
        createdDate,
        createdAt: new Date().toISOString(),
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestAddress: (guestAddress || '').trim(),
        idProof: idProof ? `${idProof} (${idProofNumber || 'N/A'})` : 'Present at Check-in',
        checkInDate,
        checkInTime,
        stayType: '24 Hours Full Day Stay',
        roomKey: roomKey || 'luxury',
        roomName: roomName || 'Luxury Room',
        guestsCount: parseInt(guestsCount, 10) || 1,
        roomsCount: parseInt(roomsCount, 10) || 1,
        specialRequests: (specialRequests || '').trim(),
        totalPrice: totalPrice || '₹ 0',
        status: 'Confirmed'
    };

    const bookings = readBookings();
    bookings.unshift(newBooking);
    writeBookings(bookings);

    res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: newBooking
    });
});

module.exports = router;
