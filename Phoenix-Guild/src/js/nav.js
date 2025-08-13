import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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

export { auth };

let lastAuthState = null; // store last known sign-in state

export function setupNavLinks() {
    const navElement = document.getElementById('main-nav');

    onAuthStateChanged(auth, (user) => {
        const isSignedIn = !!user;
        if (isSignedIn === lastAuthState) {
            // No change in auth state, don't rebuild nav
            return;
        }
        lastAuthState = isSignedIn;

        // Remove old dynamic links
        navElement.querySelectorAll('li.auth-link').forEach(el => el.remove());

        if (isSignedIn) {
            // Profile link
            const profileLi = document.createElement('li');
            profileLi.classList.add('auth-link');
            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.textContent = 'Profile';
            profileLi.appendChild(profileLink);

            // Sign out link
            const signOutLi = document.createElement('li');
            signOutLi.classList.add('auth-link');
            const signOutLink = document.createElement('a');
            signOutLink.href = '#';
            signOutLink.textContent = 'Sign Out';
            signOutLink.addEventListener('click', async (e) => {
                e.preventDefault();
                await signOut(auth);
                window.location.reload();
            });
            signOutLi.appendChild(signOutLink);

            navElement.appendChild(profileLi);
            navElement.appendChild(signOutLi);
        } else {
            // Sign In link
            const signInLi = document.createElement('li');
            signInLi.classList.add('auth-link');
            const signInLink = document.createElement('a');
            signInLink.href = 'signin.html';
            signInLink.textContent = 'Sign In';
            signInLi.appendChild(signInLink);

            // Sign Up link
            const signUpLi = document.createElement('li');
            signUpLi.classList.add('auth-link');
            const signUpLink = document.createElement('a');
            signUpLink.href = 'signup.html';
            signUpLink.textContent = 'Sign Up';
            signUpLi.appendChild(signUpLink);

            navElement.appendChild(signInLi);
            navElement.appendChild(signUpLi);
        }

        // Highlight active link
        const links = navElement.querySelectorAll('a');
        const currentPath = window.location.pathname.split('/').pop();
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (href === 'index.html' && currentPath === '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Add click listeners for dynamic active state
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                links.forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    });
}
