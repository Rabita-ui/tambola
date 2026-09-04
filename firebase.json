// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, onSnapshot, addDoc, Timestamp, orderBy, limit, increment } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDV5yQ1F18vYtaaEy4ac31LXplCkTr2U6A",
  authDomain: "tambola-house-3dc56.firebaseapp.com",
  projectId: "tambola-house-3dc56",
  storageBucket: "tambola-house-3dc56.firebasestorage.app",
  messagingSenderId: "267918174188",
  appId: "1:267918174188:web:0bf6b47282f1b14d44c2c9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
    auth, 
    db, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    deleteDoc, 
    onSnapshot, 
    addDoc, 
    Timestamp,
    orderBy,
    limit,
    increment
};
