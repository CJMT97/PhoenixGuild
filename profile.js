import { auth, db } from './firebase-config.js'; // your Firebase initialized exports
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Elements
const nameSpan = document.getElementById('name');
const ageSpan = document.getElementById('age');
const rankSpan = document.getElementById('rank');
const allTimePtsSpan = document.getElementById('allTimePts');
const weeklyPtsSpan = document.getElementById('weeklyPts');

const dailyForm = document.getElementById('daily-tasks-form');
const dailyMessage = document.getElementById('daily-message');

const extraForm = document.getElementById('extra-tasks-form');
const extraMessage = document.getElementById('extra-message');

const debuffsForm = document.getElementById('debuffs-form');
const debuffsMessage = document.getElementById('debuffs-message');

let currentUser = null;

function redirectToSignIn() {
    alert("Please sign in to view your profile.");
    window.location.href = "signin.html";
}

onAuthStateChanged(auth, async user => {
    if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();

            const lastResetStr = userData.lastWeeklyReset || null; // stored string or null

            // Calculate the most recent Sunday 23:59:59 (local time)
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            // Calculate difference in days to last Sunday
            const diffToSunday = dayOfWeek; // because Sunday=0, days to subtract
            const lastSunday = new Date(now);
            lastSunday.setHours(23, 59, 59, 999); // set to 11:59:59.999pm today
            lastSunday.setDate(now.getDate() - diffToSunday); // move back to Sunday

            let lastResetDate = lastResetStr ? new Date(lastResetStr) : null;

            // If lastWeeklyReset is missing or before last Sunday 11:59pm, reset weeklyPoints
            if (!lastResetDate || lastResetDate < lastSunday) {
                try {
                    await updateDoc(userRef, {
                        weeklyPoints: 0,
                        lastWeeklyReset: lastSunday.toISOString(),
                        lastUpdated: serverTimestamp()
                    });
                    console.log('Weekly points reset for user:', user.uid);
                } catch (error) {
                    console.error('Error resetting weekly points:', error);
                }
            } else {
                console.log('Weekly points already reset this week');
            }
        }
    }

    if (!user) {
        redirectToSignIn();
        return;
    }
    currentUser = user;

    // Load user info
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
        const data = userDoc.data();
        nameSpan.textContent = data.name || 'N/A';
        ageSpan.textContent = data.age || 'N/A';
    } else {
        nameSpan.textContent = 'N/A';
        ageSpan.textContent = 'N/A';
    }

    // Load rank info
    const rankDoc = await getDoc(doc(db, 'users', user.uid));
    if (rankDoc.exists()) {
        const rankData = rankDoc.data();
        rankSpan.textContent = rankData.rank || 'No rank yet';
        allTimePtsSpan.textContent = rankData.points ?? 0;
        weeklyPtsSpan.textContent = rankData.weeklyPoints ?? 0;
    } else {
        rankSpan.textContent = 'No rank yet';
        allTimePtsSpan.textContent = '0';
        weeklyPtsSpan.textContent = '0';
    }
});

// Helpers to update points in userRanks document:
async function updatePoints(pointsField, incrementValue) {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);

    try {
        // Use Firestore increment to add to existing points
        await updateDoc(userRef, {
            [pointsField]: inc(incrementValue),
            lastUpdated: serverTimestamp()
        });
    } catch (err) {
        // If doc/field doesn't exist yet, create or merge it
        await setDoc(userRef, {
            [pointsField]: incrementValue,
            lastUpdated: serverTimestamp()
        }, { merge: true });
    }
}

// Extra tasks submit
extraForm.addEventListener('submit', async e => {
    e.preventDefault();
    extraMessage.textContent = '';

    const distanceKm = parseFloat(document.getElementById('distanceKm').value) || 0;
    const gymMins = parseInt(document.getElementById('gymMins').value) || 0;
    const sportMins = parseInt(document.getElementById('sportMins').value) || 0;
    const cyclingClass = document.getElementById('cyclingClass').checked;

    // Calculate points:
    const distancePts = Math.floor(distanceKm);
    const gymPts = Math.floor(gymMins / 45);
    const sportPts = Math.floor(sportMins / 30);
    const cyclingPts = cyclingClass ? 1 : 0;

    const totalExtraPts = distancePts + gymPts + sportPts + cyclingPts;

    try {
        const rankRef = doc(db, 'users', currentUser.uid);
        const rankDoc = await getDoc(rankRef);

        if (rankDoc.exists()) {
            const currentAllTime = rankDoc.data().points ?? 0;
            const currentWeekly = rankDoc.data().weeklyPoints ?? 0;

            await updateDoc(rankRef, {
                points: currentAllTime + totalExtraPts,
                weeklyPoints: currentWeekly + totalExtraPts,
                lastUpdated: serverTimestamp()
            });
        } else {
            await setDoc(rankRef, {
                points: totalExtraPts,
                weeklyPoints: totalExtraPts,
                lastUpdated: serverTimestamp()
            });
        }

        extraMessage.style.color = '#4caf50';
        extraMessage.textContent = `Extra tasks submitted (+${totalExtraPts} points)!`;

        extraForm.reset();

    } catch (err) {
        extraMessage.style.color = '#f44336';
        extraMessage.textContent = "Failed to submit extra tasks.";
        console.error(err);
    }
});

// Debuffs submit
debuffsForm.addEventListener('submit', async e => {
    e.preventDefault();
    debuffsMessage.textContent = '';

    const takeaway = document.getElementById('takeaway').checked;
    const lateWake = document.getElementById('lateWake').checked;
    const noChore = document.getElementById('noChore').checked;

    let debuffPoints = 0;
    if (takeaway) debuffPoints -= 1;
    if (lateWake) debuffPoints -= 1;
    if (noChore) debuffPoints -= 1;

    if (debuffPoints === 0) {
        debuffsMessage.style.color = '#f44336';
        debuffsMessage.textContent = "Please select at least one debuff.";
        return;
    }

    try {
        const rankRef = doc(db, 'users', currentUser.uid);
        const rankDoc = await getDoc(rankRef);

        if (rankDoc.exists()) {
            const currentAllTime = rankDoc.data().points ?? 0;
            const currentWeekly = rankDoc.data().weeklyPoints ?? 0;

            await updateDoc(rankRef, {
                points: currentAllTime + debuffPoints,
                weeklyPoints: currentWeekly + debuffPoints,
                lastUpdated: serverTimestamp()
            });
        } else {
            await setDoc(rankRef, {
                points: debuffPoints,
                weeklyPoints: debuffPoints,
                lastUpdated: serverTimestamp()
            });
        }

        debuffsMessage.style.color = '#4caf50';
        debuffsMessage.textContent = `Debuffs submitted (${debuffPoints} points)!`;

        debuffsForm.reset();

    } catch (err) {
        debuffsMessage.style.color = '#f44336';
        debuffsMessage.textContent = "Failed to submit debuffs.";
        console.error(err);
    }
});

dailyForm.addEventListener("submit", async (e) => {
    e.preventDefault();  // Prevent page reload

    const user = auth.currentUser;
    if (!user) {
        alert("You must be signed in.");
        return;
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        alert("User not found in database.");
        return;
    }

    const userData = userSnap.data();

    if (userData.lastDailyTaskDate === today) {
        alert("You have already submitted your daily task today.");
        return;
    }

    const currentPoints = userData.points || 0;
    const currentWeeklyPoints = userData.weeklyPoints || 0;

    try {
        await updateDoc(userRef, {
            points: currentPoints + 5,
            weeklyPoints: currentWeeklyPoints + 5,
            lastDailyTaskDate: today
        });
        dailyMessage.style.color = '#4caf50';
        dailyMessage.textContent = "Daily task submitted! +5 points.";
        dailyForm.reset();  // Reset checkboxes
    } catch (error) {
        console.error("Error updating points:", error);
        dailyMessage.style.color = '#f44336';
        dailyMessage.textContent = "Failed to submit daily task.";
    }
});


