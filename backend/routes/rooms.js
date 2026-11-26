const express = require('express');
const router = express.Router();

// Room pricing and metadata
const ROOM_PRICING = {
    luxury: {
        id: 'luxury',
        name: 'Luxury Room',
        base24: 1890,
        maxGuests: 2,
        count: 11,
        description: 'Cozy and elegant accommodation featuring high-speed WiFi, air conditioning, and premium toiletries.'
    },
    premium: {
        id: 'premium',
        name: 'Premium Room',
        base24: 2100,
        maxGuests: 2,
        count: 6,
        description: 'Spacious room with king-sized bed, work desk, smart TV, and deluxe bathroom.'
    },
    suite: {
        id: 'suite',
        name: 'Suite Room',
        base24: 3300,
        maxGuests: 4,
        count: 1,
        description: 'Grand executive suite with separate living area, mini fridge, luxury furnishings, and scenic views.'
    }
};

// GET /api/rooms - Get all room tariffs
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: ROOM_PRICING
    });
});

// GET /api/rooms/:id - Get specific room by id
router.get('/:id', (req, res) => {
    const room = ROOM_PRICING[req.params.id.toLowerCase()];
    if (!room) {
        return res.status(404).json({ success: false, message: 'Room type not found' });
    }
    res.json({ success: true, data: room });
});

module.exports = router;
