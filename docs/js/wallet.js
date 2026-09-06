
// Wallet Management Module
function listenToWallet(userId) {
  if (!userId) return;

  db.collection("users").doc(userId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const walletDisplay = document.getElementById("user-wallet-display");
        if (walletDisplay) {
          walletDisplay.innerText = `Wallet: ${userData.walletBalance || 0} Tokens`;
        }
      }
    }, (error) => {
      console.error("Error loading wallet balance:", error);
    });
}

// Global Auth State Observer
auth.onAuthStateChanged((user) => {
  if (user) {
    listenToWallet(user.uid);
  }
});
