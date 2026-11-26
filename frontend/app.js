/* ==========================================================================
   KRISHNA GRAND LUXURY ROOMS - INTERACTIVE ENGINE & BOOKING LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initDatePickers();
    fetchRoomPricing();
    calculatePrice();
    setupMobileNav();
    loadStoredBookings();
    initVisualEffects();
});

// Fetch Room Pricing dynamically from Backend API
async function fetchRoomPricing() {
    try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
            const result = await res.json();
            if (result.data) {
                Object.assign(ROOM_PRICING, result.data);
                calculatePrice();
            }
        }
    } catch (e) {
        // Uses default ROOM_PRICING dictionary if offline
    }
}

// Room Pricing Data Dictionary
const ROOM_PRICING = {
    'luxury': {
        name: 'Luxury Room',
        base24: 1890,
        maxGuests: 2,
        count: 11
    },
    'premium': {
        name: 'Premium Room',
        base24: 2100,
        maxGuests: 2,
        count: 6
    },
    'suite': {
        name: 'Suite Room',
        base24: 3300,
        maxGuests: 4,
        count: 1
    }
};

// Set default date picker to today and set min attribute
function initDatePickers() {
    const dateInput = document.getElementById('checkInDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }
}

// Calculate Price based on selected room, and number of rooms
function calculatePrice() {
    const roomKey = document.getElementById('roomTypeSelect').value;
    const roomsCount = parseInt(document.getElementById('roomsCount').value) || 1;
    const guestsCount = parseInt(document.getElementById('guestsCount').value) || 2;

    const roomData = ROOM_PRICING[roomKey] || ROOM_PRICING['luxury'];

    let baseRate = roomData.base24;

    // Extra guest fee if > maxGuests per room
    let totalPerRoom = baseRate;
    const extraGuests = Math.max(0, guestsCount - (roomData.maxGuests * roomsCount));
    if (extraGuests > 0) {
        totalPerRoom += (extraGuests * 300); // 300 per extra mattress/person
    }

    const totalPrice = totalPerRoom * roomsCount;

    // Format Price
    const formattedPrice = `₹ ${totalPrice.toLocaleString('en-IN')}`;
    const priceDisplay = document.getElementById('computedPrice');
    if (priceDisplay) priceDisplay.innerText = formattedPrice;

    // Subtext details
    let subtext = `(24 Hours Stay × ${roomsCount} Room${roomsCount > 1 ? 's' : ''})`;
    if (extraGuests > 0) {
        subtext += ` incl. ${extraGuests} extra mattress`;
    }
    const priceSubtext = document.getElementById('priceSubtext');
    if (priceSubtext) priceSubtext.innerText = subtext;

    return totalPrice;
}

// Pre-select room from room card click
function selectRoomForBooking(roomKey) {
    const roomSelect = document.getElementById('roomTypeSelect');
    if (roomSelect) {
        roomSelect.value = roomKey;
        calculatePrice();

        // Smooth scroll to booking section
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Handle Form Submission
async function handleBookingSubmit(event) {
    event.preventDefault();

    const guestName = document.getElementById('guestName').value.trim();
    const guestPhone = document.getElementById('guestPhone').value.trim();
    const guestAddress = document.getElementById('guestAddress') ? document.getElementById('guestAddress').value.trim() : '';
    const checkInDate = document.getElementById('checkInDate').value;
    const checkInTime = document.getElementById('checkInTime').value;
    const roomKey = document.getElementById('roomTypeSelect').value;
    const guestsCount = document.getElementById('guestsCount').value;
    const roomsCount = document.getElementById('roomsCount').value;
    const specialRequests = document.getElementById('specialRequests').value.trim();

    if (!guestName || !guestPhone) {
        alert('Please provide guest full name and a valid 10-digit mobile number.');
        return;
    }

    const totalPrice = calculatePrice();
    const bookingId = 'KG-' + Math.floor(100000 + Math.random() * 900000);
    const createdDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let bookingRecord = {
        bookingId,
        createdDate,
        guestName,
        guestPhone,
        guestAddress,
        idProof: 'Verify at Check-in',
        checkInDate,
        checkInTime,
        stayType: '24 Hours Full Day Stay',
        roomKey,
        roomName: (ROOM_PRICING[roomKey] && ROOM_PRICING[roomKey].name) || 'Luxury Room',
        guestsCount,
        roomsCount,
        specialRequests,
        totalPrice: `₹ ${totalPrice.toLocaleString('en-IN')}`
    };

    // Save to Backend API
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingRecord)
        });

        if (response.ok) {
            const resData = await response.json();
            if (resData.data) {
                bookingRecord = resData.data;
            }
        }
    } catch (apiError) {
        console.warn('Backend unavailable, fallback to local storage:', apiError);
    }

    // Save to LocalStorage as well
    saveBooking(bookingRecord);

    // Display Voucher Modal
    displayVoucher(bookingRecord);

    // Send to WhatsApp directly
    const addressLine = bookingRecord.guestAddress ? `%0A*City/Address:* ${bookingRecord.guestAddress}` : '';
    const waMessage = `Hello Krishna Grand Lodge,%0A%0AI would like to confirm my room booking! Here are my details:%0A*Booking ID:* ${bookingRecord.bookingId}%0A*Guest Name:* ${bookingRecord.guestName}%0A*Phone:* ${bookingRecord.guestPhone}${addressLine}%0A*Check-in Date:* ${bookingRecord.checkInDate} at ${bookingRecord.checkInTime}%0A*Room:* ${bookingRecord.roomName} (${bookingRecord.roomsCount} Room/s)%0A*Total Amount:* ${bookingRecord.totalPrice}%0A%0APlease confirm my reservation. Thank you!`;
    window.open(`https://wa.me/919666798444?text=${waMessage}`, '_blank');
}

// Populate & Show Voucher Modal
function displayVoucher(record) {
    document.getElementById('vBookingId').innerText = record.bookingId;
    document.getElementById('vCreatedDate').innerText = record.createdDate;
    document.getElementById('vGuestName').innerText = record.guestName;
    document.getElementById('vGuestPhone').innerText = record.guestPhone;
    document.getElementById('vCheckInDate').innerText = record.checkInDate;
    document.getElementById('vStaySlot').innerText = `${record.checkInTime} (24 Hours Stay)`;
    document.getElementById('vRoomType').innerText = record.roomName;
    document.getElementById('vGuestsCount').innerText = `${record.guestsCount} Guests | ${record.roomsCount} Room(s)`;
    if (document.getElementById('vGuestAddress')) {
        document.getElementById('vGuestAddress').innerText = record.guestAddress || 'City Not Specified';
    }
    if (document.getElementById('vIdProof')) {
        document.getElementById('vIdProof').innerText = record.idProof || 'Present at Check-in';
    }
    document.getElementById('vTotalAmount').innerText = record.totalPrice;

    const modal = document.getElementById('voucherModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeVoucherModal() {
    const modal = document.getElementById('voucherModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Send Direct WhatsApp Booking message without submitting modal
function sendWhatsAppBooking() {
    const guestName = document.getElementById('guestName').value.trim() || 'Guest';
    const guestPhone = document.getElementById('guestPhone').value.trim() || '';
    const checkInDate = document.getElementById('checkInDate').value;
    const checkInTime = document.getElementById('checkInTime').value;
    const roomKey = document.getElementById('roomTypeSelect').value;
    const totalPrice = calculatePrice();

    const text = `Hello Krishna Grand Luxury Rooms,%0A%0AI would like to reserve a slot:%0A- *Guest Name:* ${guestName}%0A- *Mobile:* ${guestPhone}%0A- *Date:* ${checkInDate} at ${checkInTime}%0A- *Stay Duration:* 24 Hours%0A- *Room:* ${ROOM_PRICING[roomKey].name}%0A- *Est. Tariff:* ₹ ${totalPrice.toLocaleString('en-IN')}%0A%0AKindly confirm availability!`;

    window.open(`https://wa.me/919666798444?text=${text}`, '_blank');
}

// Local Storage Helper
function saveBooking(record) {
    let bookings = [];
    try {
        bookings = JSON.parse(localStorage.getItem('krishna_grand_bookings')) || [];
    } catch (e) {
        bookings = [];
    }
    bookings.unshift(record);
    localStorage.setItem('krishna_grand_bookings', JSON.stringify(bookings));
}

function loadStoredBookings() {
    // Keeps local history accessible
}

// Booking Search / Lookup Modal Logic
function openLookupModal() {
    document.getElementById('lookupModal').classList.add('active');
    document.getElementById('lookupResult').innerHTML = '';
}

function closeLookupModal() {
    document.getElementById('lookupModal').classList.remove('active');
}

async function searchBooking() {
    const queryInput = document.getElementById('lookupQuery');
    const query = queryInput ? queryInput.value.trim() : '';
    const resultDiv = document.getElementById('lookupResult');

    if (!query) {
        resultDiv.innerHTML = '<p class="text-danger">Please enter a phone number or Booking ID.</p>';
        return;
    }

    resultDiv.innerHTML = '<p style="color:#7A1C1C; text-align:center;"><i class="fa-solid fa-spinner fa-spin"></i> Searching bookings database...</p>';

    let found = null;

    // 1. Try querying backend API
    try {
        const response = await fetch(`/api/bookings/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
            const resData = await response.json();
            if (resData.success && resData.data) {
                found = resData.data;
            }
        }
    } catch (e) {
        console.warn('Backend search unreachable, fallback to local storage:', e);
    }

    // 2. Fallback to localStorage if not found on backend or backend offline
    if (!found) {
        let bookings = [];
        try {
            bookings = JSON.parse(localStorage.getItem('krishna_grand_bookings')) || [];
        } catch (e) {
            bookings = [];
        }

        const qLower = query.toLowerCase();
        found = bookings.find(b =>
            (b.bookingId && b.bookingId.toLowerCase() === qLower) ||
            (b.guestPhone && b.guestPhone.includes(query))
        );
    }

    if (found) {
        resultDiv.innerHTML = `
            <div class="card p-3" style="background:#F7F5F0; border:1px solid #D4AF37; border-radius:8px;">
                <h4 style="color:#7A1C1C; margin-bottom:5px;">Booking Found: ${found.bookingId}</h4>
                <p><strong>Guest:</strong> ${found.guestName} (${found.guestPhone})</p>
                <p><strong>Check-in:</strong> ${found.checkInDate} | ${found.stayType || '24 Hours Stay'}</p>
                <p><strong>Room:</strong> ${found.roomName}</p>
                <button class="btn btn-sm btn-gold mt-2" onclick="closeLookupModal(); displayVoucher(JSON.parse('${JSON.stringify(found).replace(/'/g, "\\'")}'));"><i class="fa-solid fa-ticket"></i> View Full Ticket</button>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div style="background:#FFF5F5; padding:15px; border-radius:8px; border:1px solid #FFCACA; text-align:center;">
                <p style="color:#C53030; font-weight:600;">No active booking found matching "${query}".</p>
                <small>Please call front desk reception at 9848241555 / 9666798444 for instant manual verification.</small>
            </div>
        `;
    }
}

// Mobile Navigation Toggle
function setupMobileNav() {
    const toggle = document.getElementById('mobileToggle');
    const nav = document.getElementById('navMenu');

    if (toggle && nav) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = nav.classList.toggle('active');
            const icon = toggle.querySelector('i');
            if (icon) {
                icon.className = isActive ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
        });

        // Close menu on link click
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                const icon = toggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !toggle.contains(e.target)) {
                nav.classList.remove('active');
                const icon = toggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            }
        });
    }
}

/* ==========================================================================
   ROOM PHOTO GALLERIES & THUMBNAIL SWITCHER
   ========================================================================== */
const ROOM_GALLERIES = {
    luxury: {
        name: 'Luxury Room',
        price: '₹ 1,890',
        photos: [
            {
                src: 'assets/luxury-main.jpg',
                title: 'King Bed & Wardrobe',
                caption: 'King-sized bed with crisp linen, red accents, double wardrobe & split AC'
            },
            {
                src: 'assets/room-tv.jpg',
                title: 'LED TV & Work Desk',
                caption: 'Wall-mounted flat-screen TV, study/work desk, bedside AC control & washbasin'
            }
        ]
    },
    premium: {
        name: 'Premium Room',
        price: '₹ 2,100',
        photos: [
            {
                src: 'assets/premium-main.jpg',
                title: 'Spacious Bedroom & Balcony View',
                caption: 'King bed with relaxing chair, ambient lighting, and open balcony views'
            },
            {
                src: 'assets/room-tv.jpg',
                title: 'LED TV & Work Desk',
                caption: 'Wall-mounted flat-screen TV, work desk, and split air conditioning'
            }
        ]
    },
    suite: {
        name: 'Suite Room',
        price: '₹ 3,300',
        photos: [
            {
                src: 'assets/suite-wide.jpg',
                title: 'Full Suite Overview',
                caption: 'Spacious layout featuring king bedroom and dedicated living lounge'
            },
            {
                src: 'assets/suite-bed.jpg',
                title: 'Master Bedroom & Split AC',
                caption: 'Comfortable king bed with fresh white linen, red accents & individual climate control'
            },
            {
                src: 'assets/suite-lounge.jpg',
                title: 'Private Living Lounge & LED TV',
                caption: 'Plush sofa set, coffee table, writing desk, and wall-mounted smart LED TV'
            }
        ]
    }
};

let activeGalleryType = 'suite';
let activeGalleryIdx = 0;

// Switch thumbnail on any room card
function switchRoomPhoto(targetImgId, imgSrc, btn) {
    const mainImg = document.getElementById(targetImgId);
    if (mainImg) {
        mainImg.style.opacity = '0.4';
        setTimeout(() => {
            mainImg.src = imgSrc;
            mainImg.style.opacity = '1';
        }, 150);
    }
    if (btn && btn.parentElement) {
        btn.parentElement.querySelectorAll('.room-thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
}

// Backward compatibility for suite card
function switchSuitePhoto(imgSrc, btn, idx) {
    switchRoomPhoto('suiteMainImg', imgSrc, btn);
    if (typeof idx === 'number') activeGalleryIdx = idx;
}

// Open full-screen photo gallery modal for any room type
function openRoomGallery(roomType = 'suite', idx = 0) {
    activeGalleryType = roomType;
    activeGalleryIdx = idx;
    updateGalleryView();
    const modal = document.getElementById('suiteGalleryModal');
    if (modal) modal.classList.add('active');
}

// Backward compatibility helper
function openSuiteGallery(idx = 0) {
    openRoomGallery('suite', idx);
}

function closeSuiteGallery() {
    const modal = document.getElementById('suiteGalleryModal');
    if (modal) modal.classList.remove('active');
}

function navigateGallery(direction) {
    const data = ROOM_GALLERIES[activeGalleryType] || ROOM_GALLERIES['suite'];
    activeGalleryIdx = (activeGalleryIdx + direction + data.photos.length) % data.photos.length;
    updateGalleryView();
}

function setGalleryPhoto(idx) {
    activeGalleryIdx = idx;
    updateGalleryView();
}

function updateGalleryView() {
    const data = ROOM_GALLERIES[activeGalleryType] || ROOM_GALLERIES['suite'];
    if (activeGalleryIdx >= data.photos.length) activeGalleryIdx = 0;
    const photo = data.photos[activeGalleryIdx];

    const titleElem = document.getElementById('galleryModalTitle');
    const mainImg = document.getElementById('galleryMainPhoto');
    const caption = document.getElementById('galleryCaption');
    const counter = document.getElementById('galleryCounter');
    const bookBtn = document.getElementById('galleryBookBtn');
    const thumbsStrip = document.getElementById('galleryThumbsStrip');

    if (titleElem) titleElem.innerHTML = `<i class="fa-solid fa-hotel"></i> ${data.name} Gallery (Actual Photos)`;
    if (mainImg) mainImg.src = photo.src;
    if (caption) caption.innerText = `${photo.title} - ${photo.caption}`;
    if (counter) counter.innerText = `${activeGalleryIdx + 1} / ${data.photos.length}`;
    if (bookBtn) {
        bookBtn.innerHTML = `<i class="fa-solid fa-calendar-check"></i> Book ${data.name} (${data.price})`;
        bookBtn.onclick = () => { closeSuiteGallery(); selectRoomForBooking(activeGalleryType); };
    }

    if (thumbsStrip) {
        thumbsStrip.innerHTML = data.photos.map((p, i) => `
            <img src="${p.src}" class="g-thumb ${i === activeGalleryIdx ? 'active' : ''}" onclick="setGalleryPhoto(${i})" alt="${p.title}">
        `).join('');
    }
}

/* ==========================================================================
   LUXURY INTERACTIVE EFFECTS ENGINE
   ========================================================================== */

function initVisualEffects() {
    initScrollReveal();
    initStickyHeaderEffects();
    initBackToTop();
    initButtonRipples();
    initStatCounters();
}

// 1. Smooth Scroll-Driven Reveal Animations with Stagger
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('revealed'));
    }
}

// 2. Sticky Header Elevation & Frosted Blur on Scroll
function initStickyHeaderEffects() {
    const header = document.getElementById('header');
    if (!header) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 40) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// 3. Floating Back to Top Button
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 350) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 4. Subtle Radial Ripple Effect on Button Clicks
function initButtonRipples() {
    const buttons = document.querySelectorAll('.btn, .float-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Avoid adding ripple if element already has many children or is disabled
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');

            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;

            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// 5. Animated Number Counter for Highlights
function initStatCounters() {
    const counterElements = document.querySelectorAll('[data-counter]');
    if (!counterElements.length) return;

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalVal = parseInt(target.getAttribute('data-counter'), 10);
                    const suffix = target.getAttribute('data-suffix') || '';
                    animateCounter(target, finalVal, suffix);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.3 });

        counterElements.forEach(el => counterObserver.observe(el));
    }
}

function animateCounter(element, targetValue, suffix = '') {
    const duration = 1400; // ms
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out quart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const currentVal = Math.floor(easeProgress * targetValue);

        element.innerText = `${currentVal}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.innerText = `${targetValue}${suffix}`;
        }
    }

    requestAnimationFrame(update);
}
