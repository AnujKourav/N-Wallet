// auth.js

// Check if User is Logged In
auth.onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in, show notes
        showNotes();
        populateTagFilter();
    } else {
        // No user is signed in, redirect to Login Page
        if (!window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
            window.location.href = "login.html";
        }
    }
});
