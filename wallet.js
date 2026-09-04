rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Payment screenshots - users can upload their own
    match /payment-screenshots/{userId}/{allPaths=**} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Movie videos - only admins can upload, only users with active rentals can view
    match /videos/{movieId} {
      allow read: if request.auth != null && 
        exists(/databases/(default)/documents/rentals/$(movieId)/$(request.auth.uid));
      allow write: if request.auth != null && 
        get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
