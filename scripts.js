// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    setDoc, 
    onSnapshot, 
    query, 
    where, 
    serverTimestamp,
    getDoc // Add this import
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAn_zNl4kzmMIXPjG0EE9IJTUwPEXK_mL8",
    authDomain: "valohq.firebaseapp.com",
    databaseURL: "https://valohq-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "valohq",
    storageBucket: "valohq.firebasestorage.app",
    messagingSenderId: "368885437583",
    appId: "1:368885437583:web:7124c203a9466cfc25ccfa",
    measurementId: "G-FQRMHJ06YQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication Functions
export function signUp(email, password, displayName, riotId) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('User registered:', userCredential.user.email);
            saveUserData(userCredential.user, displayName, riotId); // Save user data
        })
        .catch((error) => {
            console.error('Error signing up:', error.message);
        });
}

export function signIn(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('User logged in:', userCredential.user.email);
            window.location.href = '/'; // Redirect to homepage
        })
        .catch((error) => {
            console.error('Error signing in:', error.message);
        });
}

export function signOutUser() {
    signOut(auth)
        .then(() => {
            console.log('User signed out');
            window.location.href = '/login.html'; // Redirect to login page after sign out
        })
        .catch((error) => {
            console.error('Error signing out:', error.message);
        });
}

// Save User Data to Firestore
export function saveUserData(user, displayName, riotId) {
    setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName,
        riotId: riotId
    }).then(() => {
        console.log('User data saved to Firestore');
        window.location.href = '/'; // Redirect to homepage
    }).catch((error) => {
        console.error('Error saving user data:', error);
    });
}

// Fetch User Data from Firestore
export function fetchUserData(userId) {
    getDoc(doc(db, 'users', userId))
        .then((doc) => {
            if (doc.exists()) {
                console.log('User data:', doc.data());
            } else {
                console.error('User data not found');
            }
        })
        .catch((error) => {
            console.error('Error fetching user data:', error);
        });
}

// Send Invite
export function sendInvite(toUserId) {
    const fromUserId = auth.currentUser?.uid;

    if (!fromUserId) {
        console.error('User not logged in');
        return;
    }

    addDoc(collection(db, 'invites'), {
        from: fromUserId,
        to: toUserId,
        timestamp: serverTimestamp()
    }).then(() => {
        console.log('Invite sent');
    }).catch((error) => {
        console.error('Error sending invite:', error);
    });
}

// Listen for Invites
let unsubscribeInvites = null; // Store the unsubscribe function for the Firestore listener

export function listenForInvites() {
    const currentUserId = auth.currentUser?.uid;

    if (!currentUserId) {
        console.error('User not logged in');
        return;
    }

    const q = query(collection(db, 'invites'), where('to', '==', currentUserId));
    unsubscribeInvites = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const invite = change.doc.data();
                console.log('New invite from:', invite.from);
                showInvitePrompt(invite.from);
            }
        });
    }, (error) => {
        console.error('Error listening for invites:', error);
    });
}

// Show Invite Prompt
export function showInvitePrompt(from) {
    const prompt = document.getElementById('invitePrompt');
    const inviteFrom = document.getElementById('inviteFrom');

    if (!prompt || !inviteFrom) {
        console.error('Invite prompt elements not found');
        return;
    }

    inviteFrom.textContent = from;
    prompt.style.display = 'block';

    document.getElementById('acceptInvite').addEventListener('click', () => {
        alert('You accepted the invite from ' + from);
        prompt.style.display = 'none';
    });

    document.getElementById('rejectInvite').addEventListener('click', () => {
        alert('You rejected the invite from ' + from);
        prompt.style.display = 'none';
    });
}

// Initialize App
export function initApp() {
    onAuthStateChanged(auth, (user) => {
        const currentPage = window.location.pathname.split('/').pop();

        // Do not redirect if the user is on the login or register page
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            return;
        }

        if (user) {
            console.log('User is signed in:', user.email);
            fetchUserData(user.uid); // Fetch user data
            listenForInvites(); // Listen for invites

            // Update UI
            const userEmailElement = document.getElementById('userEmail');
            const loginButton = document.getElementById('loginButton');

            if (userEmailElement && loginButton) {
                userEmailElement.textContent = user.email;
                loginButton.textContent = 'Logout';
                loginButton.href = '#'; // Prevent default behavior
                loginButton.addEventListener('click', () => {
                    signOutUser();
                });
            }
        } else {
            console.log('User is signed out');
            // Redirect to login page only if not already on login or register page
            if (currentPage !== 'login.html' && currentPage !== 'register.html') {
                window.location.href = '/login.html';
            }
        }
    });
}

// Cleanup Firestore listeners when the page is unloaded
window.addEventListener('beforeunload', () => {
    if (unsubscribeInvites) {
        unsubscribeInvites(); // Unsubscribe from the Firestore listener
    }
});
