// firebaseConfig.js

// Your Firebase Project Configuration
const firebaseConfig = {
    apiKey: "...",
    authDomain: "nwallet-4fe43.firebaseapp.com",
    projectId: "nwallet-4fe43",
    storageBucket: "nwallet-4fe43.appspot.com",
    messagingSenderId: "289530977279",
    appId: "1:289530977279:web:4ec7386f72aad79419a5ca"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Create Firestore Database and Authentication references
  const db = firebase.firestore();
  const auth = firebase.auth();
  
