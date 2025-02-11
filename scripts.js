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
function signUp(email, password, displayName, riotId) {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('User registered:', userCredential.user.email);
            saveUserData(userCredential.user, displayName, riotId); // Save user data
        })
        .catch((error) => {
            console.error('Error signing up:', error.message);
        });
}

function signIn(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('User logged in:', userCredential.user.email);
            window.location.href = '/'; // Redirect to homepage
        })
        .catch((error) => {
            console.error('Error signing in:', error.message);
        });
}

function signOut() {
    signOut(auth)
        .then(() => {
            console.log('User signed out');
        })
        .catch((error) => {
            console.error('Error signing out:', error.message);
        });
}

// Save User Data to Firestore
function saveUserData(user, displayName, riotId) {
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
function fetchUserData(userId) {
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
function sendInvite(toUserId) {
    const fromUserId = auth.currentUser.uid;

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
function listenForInvites() {
    const currentUserId = auth.currentUser.uid;

    const q = query(collection(db, 'invites'), where('to', '==', currentUserId));
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const invite = change.doc.data();
                console.log('New invite from:', invite.from);
                showInvitePrompt(invite.from);
            }
        });
    });
}

// Show Invite Prompt
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

// Initialize App
function initApp() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User is signed in:', user.email);
            fetchUserData(user.uid); // Fetch user data
            listenForInvites(); // Listen for invites
        } else {
            console.log('User is signed out');
        }
    });

    // Add event listeners for login button and auth prompt
    document.getElementById('loginButton')?.addEventListener('click', () => {
        document.getElementById('authPrompt').style.display = 'block';
    });

    document.getElementById('newUserButton')?.addEventListener('click', () => {
        window.location.href = '/register.html';
    });

    document.getElementById('existingUserButton')?.addEventListener('click', () => {
        window.location.href = '/login.html';
    });

    // Handle sign-up form submission
    document.getElementById('signUpForm')?.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const displayName = document.getElementById('displayName').value;
        const riotId = document.getElementById('riotId').value;

        signUp(email, password, displayName, riotId);
    });

    // Handle login form submission
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        signIn(email, password);
    });
}

// Run Initialization
initApp();
