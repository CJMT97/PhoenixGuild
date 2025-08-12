// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCy-a9fSGbt70MLUfH_Xg4cSXThyU7USv8",
  authDomain: "phenoixguild.firebaseapp.com",
  projectId: "phenoixguild",
  storageBucket: "phenoixguild.firebasestorage.app",
  messagingSenderId: "829936465872",
  appId: "1:829936465872:web:f01fbd13792a2ea663abd5",
  measurementId: "G-Y1GYT3N2H7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
