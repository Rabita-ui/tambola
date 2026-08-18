# Tambola Online House

A complete online Tambola (Housie) platform built with Firebase.

## Features

- **User Authentication**: Register and login with email/password
- **Admin Panel**: Schedule draws, reset tickets, approve tokens
- **300 Permanent Tickets**: Each user gets 300 unique tickets
- **Ticket Marking**: Manual and auto-marking options
- **Deposit System**: UPI payment simulation with balance tracking
- **Token System**: Request and redeem tokens for booking
- **Draw Management**: Schedule draws, auto-delete after 5 days
- **Booking System**: Book tickets for active draws

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore database

### 2. Configure Firebase

1. In your Firebase project, go to Project Settings
2. Copy your Firebase config object
3. Open `firebase-config.js` and replace the config values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};
