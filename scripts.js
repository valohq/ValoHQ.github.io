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

// Authentication Functions
function signUp(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User registered:', userCredential.user.email);
            saveUserData(userCredential.user); // Save user data to Firestore
        })
        .catch((error) => {
            console.error('Error signing up:', error.message);
        });
}

function signIn(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User logged in:', userCredential.user.email);
        })
        .catch((error) => {
            console.error('Error signing in:', error.message);
        });
}

function signOut() {
    auth.signOut()
        .then(() => {
            console.log('User signed out');
        })
        .catch((error) => {
            console.error('Error signing out:', error.message);
        });
}

// scripts.js
function signUp(email, password, displayName, riotId) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User registered:', userCredential.user.email);
            saveUserData(userCredential.user, displayName, riotId); // Save user data
        })
        .catch((error) => {
            console.error('Error signing up:', error.message);
        });
}

// scripts.js
document.getElementById('signUpForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const displayName = document.getElementById('displayName').value;
    const riotId = document.getElementById('riotId').value;

    signUp(email, password, displayName, riotId);
});

// scripts.js
function saveUserData(user, displayName, riotId) {
    db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: displayName, // User's display name
        riotId: riotId // User's Riot ID
    }).then(() => {
        console.log('User data saved to Firestore');
    }).catch((error) => {
        console.error('Error saving user data:', error);
    });
}

// Fetch User Data from Firestore
function fetchUserData(userId) {
    db.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                console.log('User data:', doc.data());
            } else {
                console.error('User data not found');
            }
        })
        .catch((error) => {
            console.error('Error fetching user data:', error);
        });
}

// scripts.js
function sendInvite(toUserId) {
    const fromUserId = auth.currentUser.uid;

    db.collection('invites').add({
        from: fromUserId,
        to: toUserId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        console.log('Invite sent');
    }).catch((error) => {
        console.error('Error sending invite:', error);
    });
}

// Listen for Invites
function listenForInvites() {
    const currentUserId = auth.currentUser.uid;

    db.collection('invites')
        .where('to', '==', currentUserId)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const invite = change.doc.data();
                    console.log('New invite from:', invite.from);
                    showInvitePrompt(invite.from);
                }
            });
        });
}

// scripts.js
function showInvitePrompt(from) {
    const prompt = document.getElementById('invitePrompt');
    prompt.style.display = 'block';
    document.getElementById('inviteFrom').textContent = from;

    document.getElementById('acceptInvite').addEventListener('click', () => {
        alert('You accepted the invite from ' + from);
        prompt.style.display = 'none';
    });

    document.getElementById('rejectInvite').addEventListener('click', () => {
        alert('You rejected the invite from ' + from);
        prompt.style.display = 'none';
    });
}
// scripts.js
function listenForInvites() {
    const currentUserId = auth.currentUser.uid;

    db.collection('invites')
        .where('to', '==', currentUserId)
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const invite = change.doc.data();
                    console.log('New invite from:', invite.from);
                    showInvitePrompt(invite.from);
                }
            });
        });
}

// scripts.js
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.email);
        listenForInvites(); // Listen for invites
    } else {
        console.log('User is signed out');
    }
});

// Initialize App
function initApp() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is signed in:', user.email);
            fetchUserData(user.uid); // Fetch user data
            listenForInvites(); // Listen for invites
        } else {
            console.log('User is signed out');
        }
    });
}
// Run Initialization
initApp();
