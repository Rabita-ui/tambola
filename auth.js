// ============================================================
// AUTHENTICATION MODULE
// ============================================================

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const userDisplay = document.getElementById('userDisplay');
const emailInput = document.getElementById('emailInput');
const passInput = document.getElementById('passInput');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const authMsg = document.getElementById('authMsg');
const adminTabBtn = document.getElementById('adminTabBtn');

// Global user state
let currentUser = null;
let isAdmin = false;

// ============================================================
// UI UPDATE
// ============================================================
function updateUI(user) {
    if (user) {
        currentUser = user;
        userDisplay.innerText = user.email || user.uid;
        loginPage.classList.add('hidden');
        mainApp.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        
        // Check if admin
        isAdmin = user.email === 'admin@tambola.com';
        if (isAdmin) {
            adminTabBtn.style.display = 'inline-block';
            document.getElementById('page-admin').classList.remove('hidden');
        } else {
            adminTabBtn.style.display = 'none';
        }
        
        // Trigger data loading in app.js
        if (window.loadUserData) {
            window.loadUserData(user);
        }
        
        // Show home page
        document.querySelector('.nav-tab[data-page="home"]')?.click();
    } else {
        currentUser = null;
        userDisplay.innerText = 'Guest';
        loginPage.classList.remove('hidden');
        mainApp.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        adminTabBtn.style.display = 'none';
    }
}

// ============================================================
// AUTH EVENT LISTENERS
// ============================================================
auth.onAuthStateChanged(updateUI);

signInBtn.onclick = () => {
    const email = emailInput.value.trim();
    const pass = passInput.value.trim();
    if (!email || !pass) {
        authMsg.innerText = '❌ Please enter email and password';
        return;
    }
    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            authMsg.innerText = '✅ Login successful!';
        })
        .catch(err => {
            authMsg.innerText = '❌ ' + err.message;
            console.error('Login error:', err);
        });
};

signUpBtn.onclick = () => {
    const email = emailInput.value.trim();
    const pass = passInput.value.trim();
    if (!email || !pass) {
        authMsg.innerText = '❌ Please enter email and password';
        return;
    }
    if (pass.length < 6) {
        authMsg.innerText = '❌ Password must be at least 6 characters';
        return;
    }
    auth.createUserWithEmailAndPassword(email, pass)
        .then(() => {
            authMsg.innerText = '✅ Registered! You can login now.';
            // Create user document in Firestore
            db.collection('users').doc(auth.currentUser.uid).set({
                balance: 0,
                tokens: 0,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(console.error);
        })
        .catch(err => {
            authMsg.innerText = '❌ ' + err.message;
            console.error('Registration error:', err);
        });
};

loginBtn.onclick = () => {
    loginPage.classList.toggle('hidden');
};

logoutBtn.onclick = () => {
    auth.signOut().then(() => {
        console.log('User signed out');
    });
};

// ============================================================
// EXPOSE FOR APP.JS
// ============================================================
window.getCurrentUser = () => currentUser;
window.getIsAdmin = () => isAdmin;
window.updateUI = updateUI;
