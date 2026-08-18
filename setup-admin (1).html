<!-- setup-admin.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KBTV - Setup Admin</title>
    <link rel="stylesheet" href="style.css" />
    <style>
        .setup-container {
            max-width: 500px;
            margin: 50px auto;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .setup-container h2 {
            text-align: center;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
        }
        .btn-primary {
            width: 100%;
            padding: 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
        }
        .btn-primary:hover {
            background: #45a049;
        }
        .result {
            margin-top: 20px;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
        }
        .success {
            background: #d4edda;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>🎬 KBTV</h1>
            <nav>
                <a href="index.html">Home</a>
                <a href="login.html">Login</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <div class="setup-container">
            <h2>🔑 Setup Admin Account</h2>
            <p style="text-align:center;color:#666;margin-bottom:20px;">
                Make an existing user an administrator
            </p>
            
            <div class="form-group">
                <label for="adminEmail">Admin Email Address</label>
                <input 
                    type="email" 
                    id="adminEmail" 
                    placeholder="Enter the email you want to make admin"
                    required
                />
            </div>
            
            <div class="form-group">
                <label for="adminPassword">Your Password</label>
                <input 
                    type="password" 
                    id="adminPassword" 
                    placeholder="Enter your password to confirm"
                    required
                />
            </div>
            
            <button onclick="setupAdmin()" class="btn-primary">
                Make this user an Admin
            </button>
            
            <div id="result" class="result"></div>
        </div>
    </main>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { 
            getAuth, 
            signInWithEmailAndPassword,
            onAuthStateChanged
        } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
        import { 
            getFirestore, 
            doc, 
            setDoc,
            getDoc,
            serverTimestamp
        } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT.appspot.com",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        window.setupAdmin = async function() {
            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value;
            const resultDiv = document.getElementById('result');
            
            if (!email || !password) {
                resultDiv.className = 'result error';
                resultDiv.innerHTML = '❌ Please enter both email and password';
                return;
            }

            try {
                resultDiv.className = 'result';
                resultDiv.innerHTML = '⏳ Logging in...';
                
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                
                if (!userDoc.exists()) {
                    await setDoc(userRef, {
                        email: user.email,
                        role: 'admin',
                        createdAt: serverTimestamp(),
                        uid: user.uid
                    });
                } else {
                    await setDoc(userRef, {
                        role: 'admin',
                        updatedAt: serverTimestamp()
                    }, { merge: true });
                }

                resultDiv.className = 'result success';
                resultDiv.innerHTML = `
                    ✅ <strong>${email}</strong> is now an admin!<br>
                    <a href="admin-dashboard.html" style="color:#155724;font-weight:bold;">Go to Admin Dashboard →</a>
                `;
                
                await user.updateProfile({
                    displayName: 'Admin'
                });

            } catch (error) {
                console.error('Error:', error);
                resultDiv.className = 'result error';
                if (error.code === 'auth/user-not-found') {
                    resultDiv.innerHTML = '❌ User not found. Please create this account first.';
                } else if (error.code === 'auth/wrong-password') {
                    resultDiv.innerHTML = '❌ Wrong password. Please try again.';
                } else {
                    resultDiv.innerHTML = '❌ Error: ' + error.message;
                }
            }
        };

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists() && userDoc.data().role === 'admin') {
                        document.getElementById('result').className = 'result success';
                        document.getElementById('result').innerHTML = `
                            ✅ You are already an admin!<br>
                            <a href="admin-dashboard.html" style="color:#155724;font-weight:bold;">Go to Dashboard →</a>
                        `;
                    }
                } catch (error) {
                    console.error('Error checking admin status:', error);
                }
            }
        });
    </script>
</body>
</html>
