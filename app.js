// ============================================================
// MAIN APPLICATION LOGIC
// ============================================================

// ============================================================
// GLOBAL STATE
// ============================================================
let tickets = [];
let autoMarkMode = false;
let userBalance = 0;
let userTokens = 0;

// ============================================================
// DOM REFERENCES
// ============================================================
const $ = id => document.getElementById(id);

// Pages
const pages = {
    home: $('page-home'),
    deposit: $('page-deposit'),
    booking: $('page-booking'),
    mybooked: $('page-mybooked'),
    draws: $('page-draws'),
    tokens: $('page-tokens'),
    admin: $('page-admin')
};

// Navigation
const navTabs = document.querySelectorAll('.nav-tab');

// ============================================================
// NAVIGATION
// ============================================================
navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const page = tab.dataset.page;
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        Object.keys(pages).forEach(key => pages[key].classList.remove('active'));
        if (pages[page]) pages[page].classList.add('active');
        
        // Refresh data for each page
        const user = window.getCurrentUser();
        if (user) {
            switch(page) {
                case 'home': fetchBalance(); fetchTickets(); fetchOngoingDraws(); break;
                case 'deposit': fetchDepositHistory(); break;
                case 'mybooked': fetchMyBooked(); break;
                case 'draws': fetchAllDraws(); break;
                case 'tokens': fetchTokenData(); break;
                case 'booking': populateBookingDraws(); break;
            }
        }
    });
});

// ============================================================
// USER DATA LOADER (called from auth.js)
// ============================================================
window.loadUserData = function(user) {
    if (!user) return;
    fetchBalance();
    fetchTickets();
    fetchOngoingDraws();
    fetchAllDraws();
    populateBookingDraws();
    fetchTokenData();
    fetchMyBooked();
    fetchDepositHistory();
};

// ============================================================
// BALANCE & TOKENS
// ============================================================
function fetchBalance() {
    const user = window.getCurrentUser();
    if (!user) return;
    
    db.collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                userBalance = data.balance || 0;
                userTokens = data.tokens || 0;
            } else {
                // Create user document if not exists
                db.collection('users').doc(user.uid).set({ balance: 0, tokens: 0 });
                userBalance = 0;
                userTokens = 0;
            }
            $('userBalance').innerText = '₹ ' + userBalance.toFixed(2);
            $('tokenBalance').innerText = userTokens;
            $('tokenPageBalance').innerText = userTokens;
        })
        .catch(console.error);
}

function updateBalance(amount) {
    const user = window.getCurrentUser();
    if (!user) return;
    
    db.collection('users').doc(user.uid)
        .update({ balance: firebase.firestore.FieldValue.increment(amount) })
        .then(() => fetchBalance())
        .catch(console.error);
}

function updateTokens(amount) {
    const user = window.getCurrentUser();
    if (!user) return;
    
    db.collection('users').doc(user.uid)
        .update({ tokens: firebase.firestore.FieldValue.increment(amount) })
        .then(() => fetchBalance())
        .catch(console.error);
}

// ============================================================
// TICKETS (300 permanent per user)
// ============================================================
function generateTicketNumbers() {
    const cols = Array.from({ length: 9 }, () => []);
    for (let col = 0; col < 9; col++) {
        const low = col * 10 + 1;
        const high = col === 8 ? 90 : low + 9;
        const pool = [];
        for (let n = low; n <= high; n++) pool.push(n);
        const count = [1, 2, 3][Math.floor(Math.random() * 3)];
        const chosen = [];
        for (let i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            chosen.push(pool.splice(idx, 1)[0]);
        }
        cols[col] = chosen.sort((a, b) => a - b);
    }
    
    const rows = [[], [], []];
    let counts = [0, 0, 0];
    for (let col = 0; col < 9; col++) {
        const nums = cols[col];
        let availableRows = [0, 1, 2].filter(r => counts[r] < 5);
        const need = nums.length;
        const chosenRows = [];
        while (chosenRows.length < need && availableRows.length) {
            const idx = Math.floor(Math.random() * availableRows.length);
            chosenRows.push(availableRows.splice(idx, 1)[0]);
        }
        chosenRows.sort((a, b) => a - b);
        for (let i = 0; i < nums.length; i++) {
            rows[chosenRows[i]].push({ col, val: nums[i] });
            counts[chosenRows[i]]++;
        }
    }
    
    return rows.map(row => {
        const grid = Array(9).fill(null);
        row.forEach(cell => grid[cell.col] = cell.val);
        return grid;
    });
}

function createTicket(userId) {
    const numbers = generateTicketNumbers();
    return {
        userId,
        numbers,
        marked: Array(3).fill().map(() => Array(9).fill(false)),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
}

function fetchTickets() {
    const user = window.getCurrentUser();
    if (!user) return;
    
    db.collection('tickets').where('userId', '==', user.uid).get()
        .then(snap => {
            if (snap.empty) {
                // Create 300 tickets for new user
                const batch = db.batch();
                for (let i = 0; i < 300; i++) {
                    const ref = db.collection('tickets').doc();
                    batch.set(ref, createTicket(user.uid));
                }
                batch.commit()
                    .then(() => renderTickets())
                    .catch(console.error);
            } else {
                renderTickets(snap);
            }
        })
        .catch(console.error);
}

function renderTickets(snapshot) {
    const container = $('ticketContainer');
    if (!snapshot) {
        // Fetch if not provided
        const user = window.getCurrentUser();
        if (!user) return;
        db.collection('tickets').where('userId', '==', user.uid).get()
            .then(snap => renderTickets(snap))
            .catch(console.error);
        return;
    }
    
    let html = '';
    tickets = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        tickets.push({ id: doc.id, ...data });
        const nums = data.numbers;
        const marked = data.marked || Array(3).fill().map(() => Array(9).fill(false));
        
        html += `<div class="ticket-grid" style="margin-bottom:10px;">`;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 9; c++) {
                const val = nums[r]?.[c] || '';
                const isMarked = marked[r]?.[c] || false;
                html += `<div class="ticket-cell ${isMarked ? 'marked' : ''} pointer" data-val="${val}" data-row="${r}" data-col="${c}">${val}</div>`;
            }
        }
        html += `</div>`;
    });
    container.innerHTML = html + `<p style="font-size:0.8rem;color:#94a3b8;">${snapshot.size} tickets shown</p>`;
}

// Manual marking - click on ticket cell
$('ticketContainer').addEventListener('click', (e) => {
    if (autoMarkMode) return;
    const cell = e.target.closest('.ticket-cell');
    if (!cell) return;
    const user = window.getCurrentUser();
    if (!user) return;
    
    const val = parseInt(cell.dataset.val);
    if (!val) return;
    
    for (let ticket of tickets) {
        const nums = ticket.numbers;
        const marked = ticket.marked || Array(3).fill().map(() => Array(9).fill(false));
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 9; c++) {
                if (nums[r]?.[c] === val && !marked[r][c]) {
                    marked[r][c] = true;
                    db.collection('tickets').doc(ticket.id).update({ marked })
                        .then(() => fetchTickets())
                        .catch(console.error);
                    return;
                }
            }
        }
    }
});

// Auto / Manual toggle
$('autoMarkBtn').onclick = () => {
    autoMarkMode = true;
    $('modeIndicator').innerText = 'Auto';
};

$('manualMarkBtn').onclick = () => {
    autoMarkMode = false;
    $('modeIndicator').innerText = 'Manual';
};

// ============================================================
// DRAWS
// ============================================================
function fetchOngoingDraws() {
    db.collection('draws')
        .where('active', '==', true)
        .orderBy('createdAt', 'desc')
        .get()
        .then(snap => {
            const container = $('ongoingDrawsList');
            if (snap.empty) {
                container.innerHTML = '<p style="color:#94a3b8;">No active draws</p>';
                return;
            }
            let html = '';
            snap.forEach(doc => {
                const data = doc.data();
                const nums = data.numbersCalled || [];
                html += `<div class="draw-card">
                            <span class="draw-id">#${doc.id.slice(0,6)}</span>
                            <span>${nums.length} numbers called</span>
                            <span class="badge badge-success">● Live</span>
                        </div>`;
            });
            container.innerHTML = html;
        })
        .catch(console.error);
}

function fetchAllDraws() {
    db.collection('draws')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get()
        .then(snap => {
            const container = $('allDrawsList');
            if (snap.empty) {
                container.innerHTML = '<p style="color:#94a3b8;">No draws yet</p>';
                return;
            }
            let html = '';
            snap.forEach(doc => {
                const data = doc.data();
                const d = data.scheduledAt?.toDate?.() || new Date();
                // Auto-delete check (5 days)
                const now = new Date();
                const diff = (now - d) / (1000 * 60 * 60 * 24);
                if (diff > 5 && data.active) {
                    // Soft delete
                    db.collection('draws').doc(doc.id).update({ active: false, deleted: true });
                }
                html += `<div class="draw-card">
                            <span class="draw-id">#${doc.id.slice(0,6)}</span>
                            <span>${d.toLocaleDateString()}</span>
                            <span>${data.numbersCalled?.length || 0} called</span>
                            <span class="badge ${data.active ? 'badge-success' : 'badge-warning'}">${data.active ? 'Active' : 'Closed'}</span>
                        </div>`;
            });
            container.innerHTML = html;
        })
        .catch(console.error);
}

function populateBookingDraws() {
    const select = $('bookingDrawSelect');
    db.collection('draws')
        .where('active', '==', true)
        .get()
        .then(snap => {
            select.innerHTML = '<option value="">-- select draw --</option>';
            snap.forEach(doc => {
                const opt = document.createElement('option');
                opt.value = doc.id;
                opt.textContent = '#' + doc.id.slice(0,6) + ' (' + (doc.data().numbersCalled?.length || 0) + ' nums)';
                select.appendChild(opt);
            });
        })
        .catch(console.error);
}

// ============================================================
// DEPOSIT
// ============================================================
$('requestDepositBtn').onclick = () => {
    const amt = parseFloat($('depositAmount').value);
    if (!amt || amt <= 0) return alert('Enter valid amount');
    const user = window.getCurrentUser();
    if (!user) return alert('Login first');
    
    db.collection('deposits').add({
        userId: user.uid,
        amount: amt,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        upi: 'tambola@upi'
    })
    .then(() => {
        $('depositMsg').innerText = '✅ Deposit request sent! (simulated approval)';
        // Auto approve for demo
        setTimeout(() => {
            db.collection('deposits')
                .where('userId', '==', user.uid)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get()
                .then(snap => {
                    if (!snap.empty) {
                        const doc = snap.docs[0];
                        doc.ref.update({ status: 'approved' });
                        updateBalance(amt);
                        fetchDepositHistory();
                        $('depositMsg').innerText = '✅ Deposit approved! +₹' + amt;
                    }
                });
        }, 1500);
        fetchDepositHistory();
    })
    .catch(console.error);
};

function fetchDepositHistory() {
    const user = window.getCurrentUser();
    if (!user) return;
    
    db.collection('deposits')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
        .then(snap => {
            const container = $('depositHistory');
            if (snap.empty) {
                container.innerHTML = '<p style="color:#94a3b8;">No requests</p>';
                return;
            }
            let html = '';
            snap.forEach(doc => {
                const d = doc.data();
                html += `<div class="flex-between" style="border-bottom:1px solid #e9edf2; padding:6px 0;">
                            <span>₹${d.amount}</span>
                            <span class="badge ${d.status === 'approved' ? 'badge-success' : 'badge-warning'}">${d.status}</span>
                            <span style="font-size:0.8rem;color:#94a3b8;">${d.createdAt?.toDate?.()?.toLocaleDateString() || ''}</span>
                        </div>`;
            });
            container.innerHTML = html;
        })
        .catch(console.error);
}

// Quick deposit button on home
$('quickDepositBtn').onclick = () => {
    document.querySelector('.nav-tab[data-page="deposit"]')?.click();
};

// ============================================================
// BOOKING
// ============================================================
$('bookTicketsBtn').onclick = () => {
    const drawId = $('bookingDrawSelect').value;
    const qty = parseInt($('bookingQty').value) || 1;
    const user = window.getCurrentUser();
    
    if (!drawId) return alert('Select a draw');
    if (!user) return alert('Login first');
    if (userTokens < qty) return alert('Not enough tokens!');
    
    // Book tickets
    const batch = db.batch();
    const bookingRef = db.collection('bookings').doc();
    batch.set(bookingRef, {
        userId: user.uid,
        drawId: drawId,
        quantity: qty,
        bookedAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'confirmed'
    });
    
    // Deduct tokens
    const userRef = db.collection('users').doc(user.uid);
    batch.update(userRef, { tokens: firebase.firestore.FieldValue.increment(-qty) });
    
    batch.commit()
        .then(() => {
            $('bookingMsg').innerText = `✅ Booked ${qty} ticket(s) for draw #${drawId.slice(0,6)}`;
            fetchBalance();
            fetchMyBooked();
            populateBookingDraws();
        })
        .catch(console.error);
};

function fetchMyBooked() {
    const user = window.getCurrentUser();
    if (!user) return;
    
    db.collection('bookings')
        .where('userId', '==', user.uid)
        .orderBy('bookedAt', 'desc')
        .get()
        .then(snap => {
            const container = $('myBookedList');
            if (snap.empty) {
                container.innerHTML = '<p style="color:#94a3b8;">No bookings yet.</p>';
                return;
            }
            let html = '';
            snap.forEach(doc => {
                const d = doc.data();
                html += `<div class="draw-card">
                            <span>🎫 ${d.quantity} tickets</span>
                            <span>Draw: #${d.drawId?.slice(0,6) || '?'}</span>
                            <span class="badge badge-success">${d.status || 'confirmed'}</span>
                            <span style="font-size:0.8rem;color:#94a3b8;">${d.bookedAt?.toDate?.()?.toLocaleDateString() || ''}</span>
                        </div>`;
            });
            container.innerHTML = html;
        })
        .catch(console.error);
}

// ============================================================
// TOKENS
// ============================================================
$('requestTokenBtn').onclick = () => {
    const user = window.getCurrentUser();
    if (!user) return alert('Login first');
    
    db.collection('tokenRequests').add({
        userId: user.uid,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert('Token request submitted!');
        fetchTokenData();
    })
    .catch(console.error);
};

$('submitTokenRequestBtn').onclick = () => {
    const code = $('tokenRequestInput').value.trim();
    const user = window.getCurrentUser();
    
    if (!code) return alert('Enter token code');
    if (!user) return alert('Login first');
    
    // Check if token exists and is unused
    db.collection('tokens')
        .where('code', '==', code)
        .where('used', '==', false)
        .get()
        .then(snap => {
            if (snap.empty) return alert('Invalid or used token');
            const doc = snap.docs[0];
            const batch = db.batch();
            batch.update(doc.ref, {
                used: true,
                usedBy: user.uid,
                usedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            const userRef = db.collection('users').doc(user.uid);
            batch.update(userRef, { tokens: firebase.firestore.FieldValue.increment(1) });
            
            batch.commit()
                .then(() => {
                    alert('✅ Token redeemed! +1 token');
                    fetchBalance();
                    fetchTokenData();
                    $('tokenRequestInput').value = '';
                })
                .catch(console.error);
        })
        .catch(console.error);
};

function fetchTokenData() {
    const user = window.getCurrentUser();
    if (!user) return;
    
    db.collection('tokenRequests')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
        .then(snap => {
            const container = $('tokenHistory');
            if (snap.empty) {
                container.innerHTML = '<p style="color:#94a3b8;">No token activity</p>';
                return;
            }
            let html = '';
            snap.forEach(doc => {
                const d = doc.data();
                html += `<div class="flex-between" style="border-bottom:1px solid #e9edf2; padding:6px 0;">
                            <span>Request</span>
                            <span class="badge ${d.status === 'approved' ? 'badge-success' : 'badge-warning'}">${d.status}</span>
                            <span style="font-size:0.8rem;color:#94a3b8;">${d.createdAt?.toDate?.()?.toLocaleDateString() || ''}</span>
                        </div>`;
            });
            container.innerHTML = html;
        })
        .catch(console.error);
}

// ============================================================
// ADMIN ACTIONS
// ============================================================
$('scheduleDrawBtn').onclick = () => {
    db.collection('draws').add({
        active: true,
        scheduledAt: firebase.firestore.Timestamp.fromDate(new Date()),
        numbersCalled: [],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert('Draw scheduled!');
        fetchAllDraws();
        fetchOngoingDraws();
        populateBookingDraws();
    })
    .catch(console.error);
};

$('resetTicketsBtn').onclick = () => {
    const user = window.getCurrentUser();
    if (!user) return;
    
    db.collection('tickets')
        .where('userId', '==', user.uid)
        .get()
        .then(snap => {
            const batch = db.batch();
            snap.forEach(doc => batch.delete(doc.ref));
            batch.commit()
                .then(() => {
                    // Create new 300 tickets
                    const batch2 = db.batch();
                    for (let i = 0; i < 300; i++) {
                        const ref = db.collection('tickets').doc();
                        batch2.set(ref, createTicket(user.uid));
                    }
                    batch2.commit()
                        .then(() => {
                            alert('300 tickets reset!');
                            fetchTickets();
                        })
                        .catch(console.error);
                })
                .catch(console.error);
        })
        .catch(console.error);
};

$('adminApproveTokenBtn').onclick = () => {
    const code = $('adminTokenInput').value.trim();
    if (!code) return alert('Enter token code');
    
    db.collection('tokens').add({
        code: code,
        used: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        alert('Token created!');
        $('adminTokenInput').value = '';
    })
    .catch(console.error);
};

// ============================================================
// INITIALIZATION
// ============================================================
console.log('Tambola App loaded successfully!');
