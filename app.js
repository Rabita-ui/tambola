// app.js - Real-time Tambola Game Sync Module

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js";

/**
 * Automatically marks drawn numbers on user tickets displayed on the page.
 * @param {number} drawnNumber - The number that was just picked/drawn.
 */
function autoTickTicketNumber(drawnNumber) {
    if (!drawnNumber) return;

    // Search for any ticket grid cells or ticket numbers on the current page matching the drawn number
    const ticketCells = document.querySelectorAll('.ticket-cell, .ticket-number, [data-ticket-number]');

    ticketCells.forEach((cell) => {
        const cellValue = parseInt(cell.dataset.ticketNumber || cell.textContent.trim(), 10);
        if (cellValue === Number(drawnNumber)) {
            cell.classList.add('marked', 'ticked', 'selected');
            // If the cell contains an input or checkbox, check it automatically
            const checkbox = cell.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    });
}

/**
 * Listens to real-time game draws from Firestore for a specific room.
 * Updates the current number display, highlights the 1-90 board, and auto-ticks user tickets.
 * @param {string} roomId - The ID of the room to listen to (e.g., 'ROOM_001')
 */
export function listenToGameUpdates(roomId = "ROOM_001") {
    // Ensure Firebase Firestore is initialized
    const db = firebase.firestore();

    db.collection("rooms").doc(roomId).onSnapshot((docSnapshot) => {
        if (!docSnapshot.exists) {
            console.warn(`Room ${roomId} does not exist.`);
            return;
        }

        const data = docSnapshot.data();
        const drawnNumbers = data.drawnNumbers || [];
        const currentNum = data.currentNum || "--";

        // 1. Update Current Number UI Display
        const currentDisplay = document.getElementById("currentNum");
        if (currentDisplay) {
            currentDisplay.textContent = currentNum;
        }

        // 2. Clear previous active highlights on the 1-90 board
        document.querySelectorAll(".number-cell").forEach((cell) => {
            cell.classList.remove("last-drawn");
        });

        // 3. Highlight all drawn numbers on the 1-90 board & auto-tick on tickets
        drawnNumbers.forEach((num) => {
            const boardCell = document.getElementById(`num-${num}`);
            if (boardCell) {
                boardCell.classList.add("drawn");
            }
            // Auto-tick this number on all user tickets on the page
            autoTickTicketNumber(num);
        });

        // 4. Highlight the most recently drawn number on the 1-90 board
        if (currentNum && currentNum !== "--") {
            const lastCell = document.getElementById(`num-${currentNum}`);
            if (lastCell) {
                lastCell.classList.add("drawn", "last-drawn");
            }
        }
    }, (error) => {
        console.error("Error listening to real-time game updates:", error);
    });
}
