// Import what you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCy-a9fSGbt70MLUfH_Xg4cSXThyU7USv8",
  authDomain: "phenoixguild.firebaseapp.com",
  projectId: "phenoixguild",
  storageBucket: "phenoixguild.firebasestorage.app",
  messagingSenderId: "829936465872",
  appId: "1:829936465872:web:f01fbd13792a2ea663abd5",
  measurementId: "G-Y1GYT3N2H7"
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Example userId (replace with real auth UID later)
const userId = "demoUser123";

// Get references to your input elements and result div here:
const pushupsInput = document.getElementById('pushups');
const situpsInput = document.getElementById('situps');
const plankInput = document.getElementById('plank');
const resultDiv = document.getElementById('result');
const calcBtn = document.getElementById('calcBtn');

// Load saved data on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const docRef = doc(db, "userRanks", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      pushupsInput.value = data.pushups;
      situpsInput.value = data.situps;
      plankInput.value = data.plank;
      displayResult(data.rating, data.rank, data.multiplier);
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
});

// Calculate and save rank on button click
calcBtn.addEventListener('click', async () => {
  const pushups = parseFloat(pushupsInput.value) || 0;
  const situps = parseFloat(situpsInput.value) || 0;
  const plank = parseFloat(plankInput.value) || 0;

  const pushupPercent = (pushups / 1000) * 100;
  const situpPercent = (situps / 1000) * 100;
  const plankPercent = (plank / 10) * 100;

  const rating = Math.min(pushupPercent, situpPercent, plankPercent);

  let rank = "E-Rank";
  let multiplier = 1.0;

  if (rating >= 90) { rank = "S-Rank"; multiplier = 1.75; }
  else if (rating >= 80) { rank = "A-Rank"; multiplier = 1.5; }
  else if (rating >= 70) { rank = "B-Rank"; multiplier = 1.25; }
  else if (rating >= 50) { rank = "C-Rank"; multiplier = 1.15; }
  else if (rating >= 25) { rank = "D-Rank"; multiplier = 1.05; }

  displayResult(rating, rank, multiplier);

  try {
    const docRef = doc(db, "userRanks", userId);
    await setDoc(docRef, {
      pushups,
      situps,
      plank,
      rating,
      rank,
      multiplier,
      lastUpdated: serverTimestamp()
    });
    console.log("Rank data saved!");
  } catch (error) {
    console.error("Error saving data:", error);
  }
});

function displayResult(rating, rank, multiplier) {
  resultDiv.innerHTML = `
      Your rating is <span>${rating.toFixed(1)}</span>.<br>
      You are in <span>${rank}</span> with a <span>${multiplier}x</span> buff to Daily Challenge Points.
    `;
}
