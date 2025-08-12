import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

const form = document.getElementById('signup-form');
const errorMsg = document.getElementById('error-msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const email = form.email.value;
    const password = form.password.value;
    const name = form.name.value.trim();
    const age = parseInt(form.age.value);

    try {
        // Create user with email/password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save extra user info in Firestore (under 'users' collection with uid as doc id)
        await setDoc(doc(db, 'users', user.uid), {
            name,
            age,
            email,
            createdAt: new Date()
        });

        alert('Signup successful! You can now log in.');
        // Optionally redirect to login or home page:
        // window.location.href = 'rank-calculator.html';

    } catch (error) {
        errorMsg.textContent = error.message;
    }
});
