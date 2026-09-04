// ticket-preview.js - All ticket preview functionality

// Sample ticket data - replace with Firebase data
const tickets = {
    'ticket001': { price: 5, numbers: generateTambolaNumbers() },
    'ticket002': { price: 10, numbers: generateTambolaNumbers() },
    'ticket003': { price: 8, numbers: generateTambolaNumbers() }
};

// Generate random Tambola numbers (3 rows x 9 columns)
function generateTambolaNumbers() {
    const grid = [];
    const rows = 3;
    const cols = 9;
    
    for (let row = 0; row < rows; row++) {
        const rowData = [];
        const numbersInRow = 5; // Each row has 5 numbers
        const positions = [];
        
        // Choose 5 random positions for numbers
        while (positions.length < numbersInRow) {
            const pos = Math.floor(Math.random() * cols);
            if (!positions.includes(pos)) {
                positions.push(pos);
            }
        }
        positions.sort((a, b) => a - b);
        
        // Generate numbers for each column
        for (let col = 0; col < cols; col++) {
            if (positions.includes(col)) {
                // Generate number based on column range
                const min = col * 10 + 1;
                const max = col * 10 + 10;
                const num = Math.floor(Math.random() * (max - min + 1)) + min;
                rowData.push(num);
            } else {
                rowData.push(null); // Empty cell
            }
        }
        grid.push(rowData);
    }
    return grid;
}

// Display ticket in preview
function showTicketPreview(ticketId, price) {
    const container = document.getElementById('ticketPreviewContainer');
    const grid = document.getElementById('tambolaGrid');
    const ticketIdEl = document.getElementById('previewTicketId');
    const priceEl = document.getElementById('previewTicketPrice');
    
    if (!container || !grid) {
        console.error('Preview container not found');
        return;
    }
    
    // Update ticket info
    ticketIdEl.textContent = `Ticket #${ticketId}`;
    priceEl.textContent = `${price} Tokens`;
    
    // Clear existing grid
    grid.innerHTML = '';
    
    // Get ticket numbers
    const ticketData = tickets[ticketId] || { numbers: generateTambolaNumbers() };
    const numbers = ticketData.numbers;
    
    // Generate grid
    numbers.forEach((row) => {
        row.forEach((number) => {
            const cell = document.createElement('div');
            cell.className = 'tambola-cell';
            
            if (number === null) {
                cell.classList.add('empty');
                cell.textContent = '';
            } else {
                cell.classList.add('filled');
                cell.textContent = number;
                // Highlight if number matches some condition (optional)
                if (number % 10 === 0) {
                    cell.classList.add('highlight');
                }
            }
            
            grid.appendChild(cell);
        });
    });
    
    // Show container with animation
    container.classList.add('active');
    
    // Store current ticket for booking
    container.dataset.currentTicket = ticketId;
    container.dataset.currentPrice = price;
    
    // Scroll to preview
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Close preview
function closePreview() {
    const container = document.getElementById('ticketPreviewContainer');
    if (container) {
        container.classList.remove('active');
    }
}

// Book from preview
function bookFromPreview() {
    const container = document.getElementById('ticketPreviewContainer');
    if (!container) return;
    
    const ticketId = container.dataset.currentTicket;
    const price = container.dataset.currentPrice;
    
    if (!ticketId) {
        alert('No ticket selected!');
        return;
    }
    
    // Here you would call your booking function
    alert(`Booking ${ticketId} for ${price} tokens...`);
    
    // Close preview after booking
    closePreview();
    
    // Update UI to show booked status
    const bookBtn = document.querySelector(`[data-ticket="${ticketId}"] .btn-book`);
    if (bookBtn) {
        bookBtn.innerHTML = '<i class="fas fa-check"></i> Booked';
        bookBtn.disabled = true;
        bookBtn.style.background = '#4a7b62';
    }
}

// Load tickets on page load
document.addEventListener('DOMContentLoaded', function() {
    const ticketList = document.getElementById('ticketList');
    if (!ticketList) return;
    
    // Sample ticket display - replace with Firebase data
    const sampleTickets = [
        { id: 'ticket001', price: 5 },
        { id: 'ticket002', price: 10 },
        { id: 'ticket003', price: 8 }
    ];
    
    sampleTickets.forEach(ticket => {
        const ticketCard = document.createElement('div');
        ticketCard.className = 'ticket-card';
        ticketCard.dataset.ticket = ticket.id;
        ticketCard.innerHTML = `
            <div class="ticket-card-header">
                <span class="ticket-id">${ticket.id}</span>
                <span class="ticket-price">${ticket.price} Tokens</span>
            </div>
            <div class="ticket-card-actions">
                <button class="btn btn-preview" onclick="showTicketPreview('${ticket.id}', ${ticket.price})">
                    <i class="fas fa-eye"></i> Preview
                </button>
                <button class="btn btn-primary btn-book" data-ticket="${ticket.id}">
                    <i class="fas fa-shopping-cart"></i> Book
                </button>
            </div>
        `;
        ticketList.appendChild(ticketCard);
        
        // Add book button functionality
        const bookBtn = ticketCard.querySelector('.btn-book');
        bookBtn.addEventListener('click', function() {
            const ticketId = this.dataset.ticket;
            const price = ticket.price;
            alert(`Booking ${ticketId} for ${price} tokens...`);
            // Implement actual booking logic here
        });
    });
});

// Firebase integration (optional)
async function loadTicketsFromFirebase() {
    try {
        // If you have Firebase initialized
        // const db = firebase.firestore();
        // const ticketsCollection = db.collection('tickets');
        // const ticketSnapshot = await ticketsCollection.get();
        
        // Process tickets from Firebase
        console.log('Loading tickets from Firebase...');
        // Your Firebase code here
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}
