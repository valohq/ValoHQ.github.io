document.getElementById('loadingSpinner').style.display = 'block';
// After data is loaded:
document.getElementById('loadingSpinner').style.display = 'none';
document.getElementById('leaderboardTable').style.display = 'table';

document.getElementById('sendInviteButton').addEventListener('click', async () => {
    try {
        const response = await fetch('/send-invite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ player: 'Player#NA1' }),
        });
        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error sending invite:', error);
    }
});

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAn_zNl4kzmMIXPjG0EE9IJTUwPEXK_mL8",
    authDomain: "valohq.firebaseapp.com",
    projectId: "valohq",
    storageBucket: "valohq.firebasestorage.app",
    messagingSenderId: "368885437583",
    appId: "1:368885437583:web:7124c203a9466cfc25ccfa",
    measurementId: "G-FQRMHJ06YQ"
  };

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
