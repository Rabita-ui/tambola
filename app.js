import { db } from './firebase-config.js';
import { ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

let pickupTimer = null;

// 1. Function for Admin/Host to start auto-pickup
export function startGlobalPickup(gameId, intervalSeconds = 5) {
  const gameRef = ref(db, `games/${gameId}`);

  update(gameRef, {
    status: 'ACTIVE',
    interval: intervalSeconds
  });

  if (pickupTimer) clearInterval(pickupTimer);

  pickupTimer = setInterval(() => {
    drawNextNumber(gameId);
  }, intervalSeconds * 1000);
}

// 2. Helper function to pick next number and save to Firebase
function drawNextNumber(gameId) {
  const gameRef = ref(db, `games/${gameId}`);

  onValue(gameRef, (snapshot) => {
    const data = snapshot.val() || {};
    if (data.status !== 'ACTIVE') return;

    let drawn = data.drawnNumbers || [];

    if (drawn.length >= 90) {
      clearInterval(pickupTimer);
      update(gameRef, { status: 'COMPLETED' });
      return;
    }

    // Filter available numbers
    const remaining = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !drawn.includes(n));
    const nextNumber = remaining[Math.floor(Math.random() * remaining.length)];
    
    drawn.push(nextNumber);

    // Save to Firebase (this automatically updates all open pages)
    update(gameRef, {
      currentNumber: nextNumber,
      drawnNumbers: drawn
    });
  }, { onlyOnce: true });
}

// 3. Listener function to sync board UI on load
export function listenToGameUpdates(gameId) {
  const gameRef = ref(db, `games/${gameId}`);

  onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Update current number element on screen
    const currentNumDisplay = document.getElementById('currentNum');
    if (currentNumDisplay && data.currentNumber) {
      currentNumDisplay.textContent = data.currentNumber;
    }

    // Highlight called numbers in the 1-90 grid
    if (data.drawnNumbers) {
      data.drawnNumbers.forEach(num => {
        const cell = document.getElementById(`num-${num}`);
        if (cell) {
          cell.classList.add('drawn');
        }
      });
    }
  });
}
