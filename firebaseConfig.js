// firebaseConfig.js

// Your Firebase Project Configuration
const firebaseConfig = {
    apiKey: "...",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Create Firestore Database and Authentication references
  const db = firebase.firestore();
  const auth = firebase.auth();
  
