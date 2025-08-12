import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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

const form = document.getElementById('signin-form');
const errorMsg = document.getElementById('error-msg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const email = form.email.value;
    const password = form.password.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Signed in
        alert('Sign-in successful!');
        // Redirect to rank calculator or home page
        window.location.href = 'rankings.html';
    } catch (error) {
        errorMsg.textContent = error.message;
    }
});
