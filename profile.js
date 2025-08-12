import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCy-a9fSGbt70MLUfH_Xg4cSXThyU7USv8",
    authDomain: "phenoixguild.firebaseapp.com",
    projectId: "phenoixguild",
    storageBucket: "phenoixguild.firebasestorage.app",
    messagingSenderId: "829936465872",
    appId: "1:829936465872:web:f01fbd13792a2ea663abd5",
    measurementId: "G-Y1GYT3N2H7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const nameSpan = document.getElementById('name');
const ageSpan = document.getElementById('age');
const rankSpan = document.getElementById('rank');
const messageDiv = document.getElementById('message');
const form = document.getElementById('daily-tasks-form');

let currentUser = null;

// Show error and redirect to signin
function redirectToSignIn() {
    alert("You must be signed in to view your profile.");
    window.location.href = "signin.html";
}

const lastPushupsSpan = document.getElementById('last-pushups');
const lastSitupsSpan = document.getElementById('last-situps');
const lastPlankSpan = document.getElementById('last-plank');

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        redirectToSignIn();
        return;
    }
    currentUser = user;

    try {
        // Load profile info
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            nameSpan.textContent = userData.name || 'N/A';
            ageSpan.textContent = userData.age || 'N/A';
        } else {
            nameSpan.textContent = 'N/A';
            ageSpan.textContent = 'N/A';
        }

        // Load current rank and last activity counts from userRanks
        const rankDocRef = doc(db, "userRanks", user.uid);
        const rankDocSnap = await getDoc(rankDocRef);

        if (rankDocSnap.exists()) {
            const rankData = rankDocSnap.data();
            rankSpan.textContent = rankData.rank || 'No rank yet';

            lastPushupsSpan.textContent = rankData.pushups ?? '0';
            lastSitupsSpan.textContent = rankData.situps ?? '0';
            lastPlankSpan.textContent = rankData.plank ?? '0';
        } else {
            rankSpan.textContent = 'No rank yet';
            lastPushupsSpan.textContent = '0';
            lastSitupsSpan.textContent = '0';
            lastPlankSpan.textContent = '0';
        }
    } catch (error) {
        console.error("Error loading profile data:", error);
        nameSpan.textContent = 'Error';
        ageSpan.textContent = 'Error';
        rankSpan.textContent = 'Error';
        lastPushupsSpan.textContent = 'Error';
        lastSitupsSpan.textContent = 'Error';
        lastPlankSpan.textContent = 'Error';
    }
});


// Handle daily tasks submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';

    if (!currentUser) {
        redirectToSignIn();
        return;
    }

    // Get checkbox states
    const pushupsDone = document.getElementById('task-pushups').checked;
    const situpsDone = document.getElementById('task-situps').checked;
    const plankDone = document.getElementById('task-plank').checked;

    if (!pushupsDone && !situpsDone && !plankDone) {
        messageDiv.style.color = '#f44336';
        messageDiv.textContent = "Please check at least one task.";
        return;
    }

    try {
        // Store daily tasks under collection 'dailyTasks' with date as doc id
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const dailyTaskDocRef = doc(db, "users", currentUser.uid, "dailyTasks", today);

        // Save or update today's tasks
        await setDoc(dailyTaskDocRef, {
            pushupsDone,
            situpsDone,
            plankDone,
            submittedAt: serverTimestamp()
        });

        messageDiv.style.color = '#4caf50';
        messageDiv.textContent = "Today's tasks submitted successfully!";

        // Optionally reset form:
        form.reset();

    } catch (error) {
        console.error("Error saving daily tasks:", error);
        messageDiv.style.color = '#f44336';
        messageDiv.textContent = "Failed to submit tasks. Please try again.";
    }
});
