// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDV5yQ1F18vYtaaEy4ac31LXplCkTr2U6A",
    authDomain: "tambola-house-3dc56.firebaseapp.com",
    projectId: "tambola-house-3dc56",
    storageBucket: "tambola-house-3dc56.firebasestorage.app",
    messagingSenderId: "267918174188",
    appId: "1:267918174188:web:0bf6b47282f1b14d44c2c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore instances for modular import across all pages
export const auth = getAuth(app);
export const db = getFirestore(app);
