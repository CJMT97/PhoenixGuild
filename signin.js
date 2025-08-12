import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

const form = document.getElementById('signin-form');
const errorMsg = document.getElementById('error-msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const email = form.email.value.trim();
    const password = form.password.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user doc exists, create if not
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
                email: user.email,
                createdAt: new Date().toISOString(),
                points: 0,
                weeklyPoints: 0,
                name: "",
                age: null,
                rank: "No rank yet"
            });
        }

        alert('Sign-in successful!');
        window.location.href = 'rankings.html';

    } catch (error) {
        errorMsg.textContent = error.message;
    }
});
