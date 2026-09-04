// Wallet Management Engine

// 1. Listen for Real-Time Balance Updates
function listenToWalletBalance(userId, callback) {
    return db.collection("users").doc(userId).onSnapshot(doc => {
        if (doc.exists) {
            const balance = doc.data().walletBalance || 0;
            callback(balance);
        }
    }, err => console.error("Wallet listener error:", err));
}

// 2. Submit Deposit Request
async function submitDepositRequest(tokens, paymentMethod, referenceNumber, note = "") {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required.");
    if (!tokens || tokens <= 0) throw new Error("Enter a valid token amount.");

    const reqRef = db.collection("depositRequests").doc();
    await reqRef.set({
        requestId: reqRef.id,
        userId: user.uid,
        userEmail: user.email,
        tokens: Number(tokens),
        paymentMethod: paymentMethod,
        referenceNumber: referenceNumber,
        note: note,
        status: "PENDING",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return reqRef.id;
}

// 3. Submit Withdrawal Request
async function submitWithdrawalRequest(tokens, payoutDetails) {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required.");
    if (!tokens || tokens <= 0) throw new Error("Enter a valid token amount.");

    const userDoc = await db.collection("users").doc(user.uid).get();
    const currentBalance = userDoc.data().walletBalance || 0;

    if (tokens > currentBalance) {
        throw new Error("Withdrawal amount exceeds available wallet balance.");
    }

    const reqRef = db.collection("withdrawalRequests").doc();
    await reqRef.set({
        requestId: reqRef.id,
        userId: user.uid,
        userEmail: user.email,
        tokens: Number(tokens),
        payoutDetails: payoutDetails,
        status: "PENDING",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return reqRef.id;
}

// 4. Fetch User Transaction Ledger
async function fetchUserTransactions(userId) {
    const snap = await db.collection("transactions")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
