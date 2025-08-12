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

export { auth };  // export auth for use in other scripts

export function setupNavLinks() {
    const navElement = document.getElementById('main-nav');
    onAuthStateChanged(auth, (user) => {
        // Remove old auth links (e.g. li with class 'auth-link')
        [...navElement.querySelectorAll('li.auth-link')].forEach(el => el.remove());

        if (user) {
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
            // Sign In and Sign Up links
            const signInLi = document.createElement('li');
            signInLi.classList.add('auth-link');
            const signInLink = document.createElement('a');
            signInLink.href = 'signin.html';
            signInLink.textContent = 'Sign In';
            signInLi.appendChild(signInLink);

            const signUpLi = document.createElement('li');
            signUpLi.classList.add('auth-link');
            const signUpLink = document.createElement('a');
            signUpLink.href = 'signup.html';
            signUpLink.textContent = 'Sign Up';
            signUpLi.appendChild(signUpLink);

            navElement.appendChild(signInLi);
            navElement.appendChild(signUpLi);
        }

        // Now get all links AFTER adding auth links
        const links = navElement.querySelectorAll('a');
        const currentPath = window.location.pathname.split('/').pop();

        // Set active class based on current URL
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (href === 'index.html' && currentPath === '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Add click listeners to update active class dynamically
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Remove 'active' from all links
                links.forEach(l => l.classList.remove('active'));
                // Add 'active' to clicked link
                e.currentTarget.classList.add('active');
            });
        });
    });
}


// Toggle nav for hamburger menu
const navToggle = document.getElementById('nav-toggle');
const navUl = document.querySelector('nav ul');

navToggle.addEventListener('click', () => {
    navUl.classList.toggle('show');
});
