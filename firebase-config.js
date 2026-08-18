// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
// Replace these values with your own Firebase project settings
const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyReplaceMe", // <-- REPLACE with your API key
    authDomain: "your-project.firebaseapp.com", // <-- REPLACE
    projectId: "your-project-id", // <-- REPLACE
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore with persistence
const db = firebase.firestore();
db.enablePersistence().catch((err) => {
    console.warn('Firestore persistence error:', err);
});

// Export for use in other scripts
const auth = firebase.auth();
