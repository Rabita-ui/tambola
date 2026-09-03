const admin = require("firebase-admin");

// Initialize Firebase Admin SDK using service account or default credentials
// Make sure to download your service account key from Firebase Console -> Project Settings -> Service Accounts
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Standard Tambola Ticket Generator Logic
 * Generates a valid 3x9 matrix layout for 1 ticket
 */
function generateTambolaLayout() {
  let layout = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  // Column number pools
  const columnRanges = [
    [1, 9],   // Col 0
    [10, 19], // Col 1
    [20, 29], // Col 2
    [30, 39], // Col 3
    [40, 49], // Col 4
    [50, 59], // Col 5
    [60, 69], // Col 6
    [70, 79], // Col 7
    [80, 90]  // Col 8
  ];

  // Pick 15 random column positions ensuring 5 numbers per row
  for (let row = 0; row < 3; row++) {
    let colsInRow = [];
    while (colsInRow.length < 5) {
      let col = Math.floor(Math.random() * 9);
      if (!colsInRow.includes(col)) {
        colsInRow.push(col);
      }
    }

    // Populate random number from column pool
    colsInRow.forEach(col => {
      let min = columnRanges[col][0];
      let max = columnRanges[col][1];
      let num = Math.floor(Math.random() * (max - min + 1)) + min;
      
      // Ensure unique numbers within the same column
      while (layout[0][col] === num || layout[1][col] === num) {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      }
      layout[row][col] = num;
    });
  }

  // Sort numbers in each column top-to-bottom
  for (let col = 0; col < 9; col++) {
    let colValues = [];
    for (let row = 0; row < 3; row++) {
      if (layout[row][col] > 0) colValues.push(layout[row][col]);
    }
    colValues.sort((a, b) => a - b);
    
    let idx = 0;
    for (let row = 0; row < 3; row++) {
      if (layout[row][col] > 0) {
        layout[row][col] = colValues[idx++];
      }
    }
  }

  return layout;
}

/**
 * Seed all 600 Master Tickets into Firestore in batches
 */
async function seedMasterTickets() {
  console.log("Starting Master Tickets seeding (T001 to T600)...");
  
  const batchSize = 400; // Firestore batch limit is 500
  let batch = db.batch();
  let count = 0;

  for (let i = 1; i <= 600; i++) {
    const ticketId = `T${String(i).padStart(3, "0")}`;
    const ticketRef = db.collection("masterTickets").doc(ticketId);

    batch.set(ticketRef, {
      ticketId: ticketId,
      layout: generateTambolaLayout(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    count++;

    if (count === batchSize || i === 600) {
      await batch.commit();
      console.log(`Committed batch of ${count} tickets.`);
      batch = db.batch();
      count = 0;
    }
  }

  console.log("✅ Successfully seeded all 600 Master Tickets!");
  process.exit(0);
}

seedMasterTickets().catch(err => {
  console.error("Error seeding tickets:", err);
  process.exit(1);
});
