// Firebase configuration with active project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDV5yQ1F18vYtaaEy4ac31LXplCkTr2U6A",
  authDomain: "tambola-house-3dc56.firebaseapp.com",
  projectId: "tambola-house-3dc56",
  storageBucket: "tambola-house-3dc56.firebasestorage.app",
  messagingSenderId: "267918174188",
  appId: "1:267918174188:web:0bf6b47282f1b14d44c2c9"
};

// Initialize Firebase safely
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Global Firebase service instances
const auth = firebase.auth();
const db = firebase.firestore();
