import { db } from './firebase-config.js';
import { ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

let pickupTimer = null;

/**
 * 1. Admin/Host starts or stops the continuous auto-pickup.
 */
export async function startGlobalPickup(gameId, intervalSeconds = 5) {
  const gameRef = ref(db, `games/${gameId}`);

  // Fetch current state to check if game is already active
  const snapshot = await get(gameRef);
  const data = snapshot.val() || {};

  // Initialize start timestamp and state if starting fresh
  const now = Date.now();
  await update(gameRef, {
    status: 'ACTIVE',
    interval: intervalSeconds,
    startedAt: data.startedAt || now,
    lastDrawnAt: now,
    drawnNumbers: data.drawnNumbers || [],
    currentNumber: data.currentNumber || null
  });

  // Start internal loop to check and trigger draws
  runGameLoop(gameId, intervalSeconds);
}

/**
 * Internal loop runner that manages intervals safely across page reloads.
 */
function runGameLoop(gameId, intervalSeconds) {
  if (pickupTimer) clearInterval(pickupTimer);

  pickupTimer = setInterval(() => {
    checkAndDrawNextNumber(gameId);
  }, intervalSeconds * 1000);
}

/**
 * 2. Checks elapsed time and draws next random number to Firebase.
 */
async function checkAndDrawNextNumber(gameId) {
  const gameRef = ref(db, `games/${gameId}`);
  const snapshot = await get(gameRef);
  const data = snapshot.val();

  if (!data || data.status !== 'ACTIVE') {
    if (pickupTimer) clearInterval(pickupTimer);
    return;
  }

  let drawn = data.drawnNumbers || [];

  // Stop if all 90 numbers have been drawn
  if (drawn.length >= 90) {
    if (pickupTimer) clearInterval(pickupTimer);
    await update(gameRef, { status: 'COMPLETED' });
    return;
  }

  // Get list of remaining numbers (1 to 90)
  const remaining = Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !drawn.includes(n));
  const nextNumber = remaining[Math.floor(Math.random() * remaining.length)];

  drawn.push(nextNumber);

  // Update game state in Firebase
  await update(gameRef, {
    currentNumber: nextNumber,
    drawnNumbers: drawn,
    lastDrawnAt: Date.now()
  });
}

/**
 * 3. Syncs the UI on both dashboard.html and game.html automatically on load.
 */
export function listenToGameUpdates(gameId) {
  const gameRef = ref(db, `games/${gameId}`);

  onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // 1. Update current drawn number display
    const currentNumDisplay = document.getElementById('currentNum');
    if (currentNumDisplay) {
      currentNumDisplay.textContent = data.currentNumber || '--';
    }

    // 2. Highlight drawn numbers on the grid board
    if (data.drawnNumbers) {
      data.drawnNumbers.forEach((num, index) => {
        const cell = document.getElementById(`num-${num}`);
        if (cell) {
          cell.classList.add('drawn');
          
          // Optional: Highlight the latest drawn number distinctly
          if (num === data.currentNumber) {
            cell.classList.add('last-drawn');
          } else {
            cell.classList.remove('last-drawn');
          }
        }
      });
    }

    // 3. Keep timer alive on current tab if status is ACTIVE
    if (data.status === 'ACTIVE' && !pickupTimer) {
      runGameLoop(gameId, data.interval || 5);
    } else if (data.status !== 'ACTIVE' && pickupTimer) {
      clearInterval(pickupTimer);
      pickupTimer = null;
    }
  });
}
