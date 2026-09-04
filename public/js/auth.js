<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambola House - User Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
        body { background: linear-gradient(145deg, #f7f3ee, #e9e1d7); color: #2d1f14; min-height: 100vh; padding: 20px; }
        .container { max-width: 600px; margin: auto; }
        
        .header { background: white; border-radius: 20px; padding: 20px 25px; margin-bottom: 20px; box-shadow: 0 5px 20px rgba(0,0,0,.08); display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 1.4rem; color: #b35e2e; }

        .card { background: white; border-radius: 20px; padding: 25px; box-shadow: 0 5px 20px rgba(0,0,0,.07); margin-bottom: 20px; text-align: center; }
        .card h3 { font-size: 1.1rem; color: #b35e2e; margin-bottom: 15px; border-bottom: 2px solid #f6f1eb; padding-bottom: 8px; }

        .balance-box { background: #f6f1eb; border-radius: 14px; padding: 20px; margin: 15px 0; }
        .balance-val { font-size: 2.5rem; font-weight: 800; color: #b35e2e; }

        /* TOP-UP GRID */
        .topup-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; }
        .topup-btn { background: #f6f1eb; border: 2px solid #ded4c9; border-radius: 12px; padding: 12px 5px; cursor: pointer; font-weight: bold; color: #2d1f14; transition: 0.2s; }
        .topup-btn:hover { border-color: #b35e2e; background: #fff; }
        .topup-btn i { color: #f39c12; margin-bottom: 5px; display: block; font-size: 1.2rem; }

        .btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1rem; text-decoration: none; display: block; text-align: center; margin-top: 10px; }
        .btn-play { background: #27ae60; color: white; }
        .btn-play:hover { background: #219150; }
        
        #authOverlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #f7f3ee; display: flex; justify-content: center; align-items: center; z-index: 2000; font-weight: bold; font-size: 1.2rem; color: #b35e2e; }
    </style>
</head>
<body>

<div id="authOverlay">
    <i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i> Loading Dashboard...
</div>

<div class="container">
    <div class="header">
        <h1><i class="fas fa-user-circle"></i> Player Dashboard</h1>
        <button onclick="logout()" style="background: none; border: none; color: #c0392b; cursor: pointer; font-weight: bold;"><i class="fas fa-sign-out-alt"></i> Logout</button>
    </div>

    <!-- PROFILE & BALANCE CARD -->
    <div class="card">
        <h2 id="userEmail" style="font-size: 1.1rem; color: #7b6856;">user@email.com</h2>
        
        <div class="balance-box">
            <div style="font-size: 0.9rem; font-weight: bold; color: #7b6856;">AVAILABLE TOKENS</div>
            <div class="balance-val" id="tokenBalance">0</div>
        </div>

        <a href="game.html" class="btn btn-play"><i class="fas fa-gamepad"></i> Enter Game Room</a>
    </div>

    <!-- TOKEN TOP-UP SECTION -->
    <div class="card">
        <h3><i class="fas fa-coins" style="color: #f39c12;"></i> Top-Up Tokens</h3>
        <p style="font-size: 0.85rem; color: #7b6856; margin-bottom: 15px;">Select a package to instantly add tokens to your balance:</p>
        
        <div class="topup-grid">
            <button class="topup-btn" onclick="addTokens(50)">
                <i class="fas fa-coins"></i> 50 Tokens
            </button>
            <button class="topup-btn" onclick="addTokens(100)">
                <i class="fas fa-coins"></i> 100 Tokens
            </button>
            <button class="topup-btn" onclick="addTokens(500)">
                <i class="fas fa-coins"></i> 500 Tokens
            </button>
        </div>
    </div>
</div>

<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>

<script>
const firebaseConfig = {
    apiKey: "AIzaSyDV5yQ1F18vYtaaEy4ac31LXplCkTr2U6A",
    authDomain: "tambola-house-3dc56.firebaseapp.com",
    projectId: "tambola-house-3dc56",
    storageBucket: "tambola-house-3dc56.firebasestorage.app",
    messagingSenderId: "267918174188",
    appId: "1:267918174188:web:ec27684544c286c044c2c9"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUserUid = null;

/* AUTH PROTECTED ROUTE */
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        currentUserUid = user.uid;
        document.getElementById("authOverlay").style.display = "none";
        document.getElementById("userEmail").textContent = user.email;

        // Fetch user token balance real-time
        db.collection("users").doc(user.uid).onSnapshot((doc) => {
            if (doc.exists) {
                document.getElementById("tokenBalance").textContent = doc.data().tokens || 0;
            }
        });
    }
});

/* TOKEN TOP-UP FUNCTION */
async function addTokens(amount) {
    if (!currentUserUid) return;

    try {
        const userRef = db.collection("users").doc(currentUserUid);
        await userRef.update({
            tokens: firebase.firestore.FieldValue.increment(amount)
        });
        alert(`Successfully added ${amount} tokens to your account!`);
    } catch (err) {
        alert("Failed to add tokens: " + err.message);
    }
}

function logout() {
    auth.signOut().then(() => window.location.href = "index.html");
}
</script>

</body>
</html>
