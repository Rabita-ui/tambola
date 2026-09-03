// Replace with your exact Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

let currentUser = null;
let selectedTickets = new Set();
const TICKET_PRICE = 10;
const currentGameId = "GAME001"; // Target default game

// 1. Authentication Listener
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("dashboard-section").style.display = "block";
    document.getElementById("logout-btn").style.display = "inline-block";
    document.getElementById("user-email-display").innerText = user.email;

    // Update lastLoginAt
    db.collection("users").doc(user.uid).set({
      lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Sync Wallet Balance Real-time
    db.collection("users").doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        document.getElementById("user-wallet-display").innerText = `Wallet: ${data.walletBalance || 0} Tokens`;
      }
    });

    initPlatform();
  } else {
    currentUser = null;
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("dashboard-section").style.display = "none";
    document.getElementById("logout-btn").style.display = "none";
  }
});

// Authentication Handlers
function handleLogin() {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-pass").value;
  auth.signInWithEmailAndPassword(email, pass).catch(err => alert(err.message));
}

function handleRegister() {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-pass").value;
  
  auth.createUserWithEmailAndPassword(email, pass).then((cred) => {
    return db.collection("users").doc(cred.user.uid).set({
      uid: cred.user.uid,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: "active",
      walletBalance: 100 // Promotional welcome credit for testing
    });
  }).catch(err => alert(err.message));
}

function handleLogout() {
  auth.signOut();
}

// 2. Initialize Platform Logic
function initPlatform() {
  renderMasterTickets();
  listenToActiveGame();
  listenToMyBookedTickets();
}

// Render Master Tickets Grid (T001 - T600)
function renderMasterTickets() {
  const grid = document.getElementById("master-tickets-grid");
  grid.innerHTML = "";

  for (let i = 1; i <= 600; i++) {
    const tId = `T${String(i).padStart(3, '0')}`;
    const card = document.createElement("div");
    card.className = "ticket-selectable-card";
    card.id = `select-card-${tId}`;
    card.innerText = tId;
    card.onclick = () => toggleTicketSelection(tId);
    grid.appendChild(card);
  }
}

// Client Calculator ("Book 6, Pay 5")
function toggleTicketSelection(ticketId) {
  if (!ticketId) return;

  if (selectedTickets.has(ticketId)) {
    selectedTickets.delete(ticketId);
    document.getElementById(`select-card-${ticketId}`).classList.remove("selected");
  } else {
    selectedTickets.add(ticketId);
    document.getElementById(`select-card-${ticketId}`).classList.add("selected");
  }

  const total = selectedTickets.size;
  const free = Math.floor(total / 6);
  const charged = total - free;
  const normal = total * TICKET_PRICE;
  const discount = free * TICKET_PRICE;
  const finalPay = charged * TICKET_PRICE;

  document.getElementById("calc-selected").innerText = total;
  document.getElementById("calc-free").innerText = free;
  document.getElementById("calc-normal").innerText = normal;
  document.getElementById("calc-discount").innerText = discount;
  document.getElementById("calc-final").innerText = `${finalPay} TOKENS`;

  document.getElementById("confirm-booking-btn").disabled = total === 0;
}

// Execute Booking via Secure Cloud Function
async function executeBooking() {
  const btn = document.getElementById("confirm-booking-btn");
  btn.disabled = true;
  btn.innerText = "Processing...";

  const bookTicketsFn = functions.httpsCallable("bookTickets");
  
  try {
    const res = await bookTicketsFn({
      gameId: currentGameId,
      selectedTicketIds: Array.from(selectedTickets)
    });
    
    alert(`Booking Confirmed! ID: ${res.data.bookingId}`);
    
    // Clear selections
    selectedTickets.forEach(id => {
      const el = document.getElementById(`select-card-${id}`);
      if (el) el.classList.remove("selected");
    });
    selectedTickets.clear();
    toggleTicketSelection(null);
  } catch (err) {
    alert(`Booking Failed: ${err.message}`);
  } finally {
    btn.innerText = "Confirm Booking";
  }
}

// 3. Listen to Active Game (Real-Time Number Board)
function listenToActiveGame() {
  db.collection("games").doc(currentGameId).onSnapshot((doc) => {
    if (!doc.exists) return;
    const game = doc.data();

    document.getElementById("current-number-val").innerText = game.currentNumber || "--";
    
    const historyBox = document.getElementById("called-history-list");
    historyBox.innerHTML = "";
    (game.calledNumbers || []).forEach((num) => {
      const badge = document.createElement("span");
      badge.className = "number-badge";
      badge.innerText = num;
      historyBox.appendChild(badge);
    });
  });
}

// 4. Listen to My Booked Tickets & Auto-Mark Grid
function listenToMyBookedTickets() {
  db.collection("gameTickets")
    .where("gameId", "==", currentGameId)
    .where("userId", "==", currentUser.uid)
    .onSnapshot((snap) => {
      const container = document.getElementById("my-tickets-container");
      container.innerHTML = "";

      if (snap.empty) {
        container.innerHTML = `<p class="subtitle">No tickets booked for this game yet.</p>`;
        return;
      }

      snap.forEach((doc) => {
        const ticket = doc.data();
        const card = document.createElement("div");
        card.className = "booked-ticket-card";

        const hasFullHouse = ticket.hasWon?.fullHouse ? '🏆 FULL HOUSE!' : '';
        let html = `<h4><span>Ticket: ${ticket.ticketId}</span> <span style="color:#facc15">${hasFullHouse}</span></h4>`;
        html += `<table class="tambola-grid">`;

        ticket.layout.forEach((row) => {
          html += `<tr>`;
          row.forEach((val) => {
            if (val === 0) {
              html += `<td class="blank-cell"></td>`;
            } else {
              const isMarked = ticket.markedNumbers && ticket.markedNumbers.includes(val);
              html += `<td class="${isMarked ? 'marked-cell' : ''}">${val}</td>`;
            }
          });
          html += `</tr>`;
        });

        html += `</table>`;
        card.innerHTML = html;
        container.appendChild(card);
      });
    });
}

// 5. Withdrawal Handler
async function handleWithdrawal() {
  const tokens = parseInt(document.getElementById("withdraw-tokens").value, 10);
  const accountDetails = document.getElementById("withdraw-details").value;

  if (!tokens || tokens <= 0 || !accountDetails) {
    alert("Please enter a valid token amount and withdrawal destination details.");
    return;
  }

  const requestWithdrawalFn = functions.httpsCallable("requestWithdrawal");
  try {
    const res = await requestWithdrawalFn({ tokens, accountDetails });
    alert(`Withdrawal request submitted! Request ID: ${res.data.requestId}`);
    document.getElementById("withdraw-tokens").value = "";
    document.getElementById("withdraw-details").value = "";
  } catch (err) {
    alert(`Withdrawal Failed: ${err.message}`);
  }
}
