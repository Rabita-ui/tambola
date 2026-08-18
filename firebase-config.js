// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTGFdmmimUbpm1zrTqaSQBO0kr2LcWs8M",
    authDomain: "mbolahouse.firebaseapp.com",
    projectId: "mbolahouse",
    storageBucket: "mbolahouse.firebasestorage.app",
    messagingSenderId: "842446053948",
    appId: "1:842446053948:web:b977bef8d84e85375f9939",
    measurementId: "G-DP949M05J1"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized successfully');
} else {
    console.warn('⚠️ Firebase SDK not loaded');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig };
}
