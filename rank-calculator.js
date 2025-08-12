// rank-calculator.js
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth } from "./nav.js";  // import auth from nav.js

const db = getFirestore();

const pushupsInput = document.getElementById('pushups');
const situpsInput = document.getElementById('situps');
const plankInput = document.getElementById('plank');
const resultDiv = document.getElementById('result');
const calcBtn = document.getElementById('calcBtn');

let currentUser = null;

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
        try {
            const docRef = doc(db, 'userRanks', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                pushupsInput.value = data.pushups ?? '';
                situpsInput.value = data.situps ?? '';
                plankInput.value = data.plank ?? '';
                displayResult(data.rating, data.rank, data.multiplier);
            }
        } catch (error) {
            console.error('Error loading rank data:', error);
        }
    } else {
        pushupsInput.value = '';
        situpsInput.value = '';
        plankInput.value = '';
        resultDiv.innerHTML = '';
    }
});

calcBtn.addEventListener('click', async () => {
    if (!currentUser) {
        alert('Please sign in first!');
        return;
    }

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
        const docRef = doc(db, "userRanks", currentUser.uid);
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
        console.error("Error saving rank data:", error);
    }
});

function displayResult(rating, rank, multiplier) {
    resultDiv.innerHTML = `
      Your rating is <span>${rating.toFixed(1)}</span>.<br>
      You are in <span>${rank}</span> with a <span>${multiplier}x</span> buff to Daily Challenge Points.
    `;
}
