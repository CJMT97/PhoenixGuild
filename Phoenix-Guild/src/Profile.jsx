import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "./assets/firebase-config"; // your firebase initialized exports
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  increment,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export default function Profile() {
  const navigate = useNavigate();

  // User info state
  const [userInfo, setUserInfo] = useState({
    name: "Loading...",
    age: "Loading...",
    rank: "Loading...",
    allTimePts: 0,
    weeklyPts: 0,
  });

  // Daily tasks state
  const [dailyTasks, setDailyTasks] = useState({
    pushups: false,
    situps: false,
    plank: false,
  });
  const [dailyMessage, setDailyMessage] = useState("");

  // Extra tasks state
  const [extraTasks, setExtraTasks] = useState({
    distanceKm: "",
    gymMins: "",
    sportMins: "",
    cyclingClass: false,
  });
  const [extraMessage, setExtraMessage] = useState("");

  // Debuffs state
  const [debuffs, setDebuffs] = useState({
    takeaway: false,
    lateWake: false,
    noChore: false,
  });
  const [debuffsMessage, setDebuffsMessage] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  // Load user data on mount + auth change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        alert("Please sign in to view your profile.");
        navigate("/signin");
        return;
      }
      setCurrentUser(user);

      // Fetch user info
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        // Reset weekly points if needed (your logic here)
        const lastResetStr = data.lastWeeklyReset || null;
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToSunday = dayOfWeek;
        const lastSunday = new Date(now);
        lastSunday.setHours(23, 59, 59, 999);
        lastSunday.setDate(now.getDate() - diffToSunday);

        let lastResetDate = lastResetStr ? new Date(lastResetStr) : null;

        if (!lastResetDate || lastResetDate < lastSunday) {
          await updateDoc(userRef, {
            weeklyPoints: 0,
            lastWeeklyReset: lastSunday.toISOString(),
            lastUpdated: serverTimestamp(),
          });
        }

        setUserInfo({
          name: data.name || "N/A",
          age: data.age || "N/A",
          rank: data.rank || "No rank yet",
          allTimePts: data.points ?? 0,
          weeklyPts: data.weeklyPoints ?? 0,
        });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handlers for daily tasks
  const handleDailyChange = (e) => {
    const { name, checked } = e.target;
    setDailyTasks((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDailySubmit = async (e) => {
    e.preventDefault();
    setDailyMessage("");

    if (!currentUser) {
      alert("You must be signed in.");
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      alert("User data not found.");
      return;
    }
    const userData = userSnap.data();

    const today = new Date().toISOString().split("T")[0];
    if (userData.lastDailyTaskDate === today) {
      setDailyMessage("You have already submitted your daily task today.");
      return;
    }

    try {
      await updateDoc(userRef, {
        points: increment(5),
        weeklyPoints: increment(5),
        lastDailyTaskDate: today,
        lastUpdated: serverTimestamp(),
      });
      setDailyMessage("Daily task submitted! +5 points.");
      setDailyTasks({ pushups: false, situps: false, plank: false });
      setUserInfo((prev) => ({
        ...prev,
        allTimePts: prev.allTimePts + 5,
        weeklyPts: prev.weeklyPts + 5,
      }));
    } catch (err) {
      setDailyMessage("Failed to submit daily task.");
      console.error(err);
    }
  };

  // Handlers for extra tasks
  const handleExtraChange = (e) => {
    const { name, type, checked, value } = e.target;
    setExtraTasks((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleExtraSubmit = async (e) => {
    e.preventDefault();
    setExtraMessage("");

    if (!currentUser) {
      alert("You must be signed in.");
      return;
    }

    const distancePts = Math.floor(parseFloat(extraTasks.distanceKm) || 0);
    const gymPts = Math.floor((parseInt(extraTasks.gymMins) || 0) / 45);
    const sportPts = Math.floor((parseInt(extraTasks.sportMins) || 0) / 30);
    const cyclingPts = extraTasks.cyclingClass ? 1 : 0;
    const totalExtraPts = distancePts + gymPts + sportPts + cyclingPts;

    const userRef = doc(db, "users", currentUser.uid);

    try {
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          points: increment(totalExtraPts),
          weeklyPoints: increment(totalExtraPts),
          lastUpdated: serverTimestamp(),
        });
      } else {
        await setDoc(
          userRef,
          {
            points: totalExtraPts,
            weeklyPoints: totalExtraPts,
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setExtraMessage(`Extra tasks submitted (+${totalExtraPts} points)!`);
      setExtraTasks({
        distanceKm: "",
        gymMins: "",
        sportMins: "",
        cyclingClass: false,
      });
      setUserInfo((prev) => ({
        ...prev,
        allTimePts: prev.allTimePts + totalExtraPts,
        weeklyPts: prev.weeklyPts + totalExtraPts,
      }));
    } catch (err) {
      setExtraMessage("Failed to submit extra tasks.");
      console.error(err);
    }
  };

  // Handlers for debuffs
  const handleDebuffsChange = (e) => {
    const { name, checked } = e.target;
    setDebuffs((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDebuffsSubmit = async (e) => {
    e.preventDefault();
    setDebuffsMessage("");

    if (!currentUser) {
      alert("You must be signed in.");
      return;
    }

    let debuffPoints = 0;
    if (debuffs.takeaway) debuffPoints -= 1;
    if (debuffs.lateWake) debuffPoints -= 1;
    if (debuffs.noChore) debuffPoints -= 1;

    if (debuffPoints === 0) {
      setDebuffsMessage("Please select at least one debuff.");
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);

    try {
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          points: increment(debuffPoints),
          weeklyPoints: increment(debuffPoints),
          lastUpdated: serverTimestamp(),
        });
      } else {
        await setDoc(
          userRef,
          {
            points: debuffPoints,
            weeklyPoints: debuffPoints,
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );
      }

      setDebuffsMessage(`Debuffs submitted (${debuffPoints} points)!`);
      setDebuffs({
        takeaway: false,
        lateWake: false,
        noChore: false,
      });
      setUserInfo((prev) => ({
        ...prev,
        allTimePts: prev.allTimePts + debuffPoints,
        weeklyPts: prev.weeklyPts + debuffPoints,
      }));
    } catch (err) {
      setDebuffsMessage("Failed to submit debuffs.");
      console.error(err);
    }
  };

  return (
    <>
      <main className="profile-container">
        <section className="user-info">
          <h2>Your Info</h2>
          <p>
            <strong>Name:</strong> <span>{userInfo.name}</span>
          </p>
          <p>
            <strong>Age:</strong> <span>{userInfo.age}</span>
          </p>
          <p>
            <strong>Rank:</strong> <span>{userInfo.rank}</span>
          </p>
          <p>
            <strong>All-Time Points:</strong> <span>{userInfo.allTimePts}</span>
          </p>
          <p>
            <strong>Weekly Points:</strong> <span>{userInfo.weeklyPts}</span>
          </p>
        </section>

        <section className="daily-tasks">
          <h2>Daily Tasks</h2>
          <form id="daily-tasks-form" onSubmit={handleDailySubmit}>
            <label id="task-pushups">
              <input
                type="checkbox"
                name="pushups"
                checked={dailyTasks.pushups}
                onChange={handleDailyChange}
              />{" "}
              Pushups
            </label>
            <br />
            <label id="task-situps">
              <input
                type="checkbox"
                name="situps"
                checked={dailyTasks.situps}
                onChange={handleDailyChange}
              />{" "}
              Situps
            </label>
            <br />
            <label id="task-plank">
              <input
                type="checkbox"
                name="plank"
                checked={dailyTasks.plank}
                onChange={handleDailyChange}
              />{" "}
              Plank
            </label>
            <br />
            <button id="dailyTaskBtn" type="submit">
              Submit Daily Task
            </button>
          </form>
          <div id="daily-message" className="message">
            {dailyMessage}
          </div>
        </section>

        <section className="extra-tasks">
          <h2>Extra Tasks</h2>
          <form id="extra-tasks-form" onSubmit={handleExtraSubmit}>
            <label>
              Distance walked (km):{" "}
              <input
                type="number"
                id="distanceKm"
                name="distanceKm"
                min="0"
                step="0.1"
                value={extraTasks.distanceKm}
                onChange={handleExtraChange}
              />
            </label>
            <br />
            <label>
              Gym session time (minutes):{" "}
              <input
                type="number"
                id="gymMins"
                name="gymMins"
                min="0"
                step="1"
                value={extraTasks.gymMins}
                onChange={handleExtraChange}
              />
            </label>
            <br />
            <label>
              Sport time (minutes):{" "}
              <input
                type="number"
                id="sportMins"
                name="sportMins"
                min="0"
                step="1"
                value={extraTasks.sportMins}
                onChange={handleExtraChange}
              />
            </label>
            <br />
            <label>
              Cycling class attended:{" "}
              <input
                type="checkbox"
                id="cyclingClass"
                name="cyclingClass"
                checked={extraTasks.cyclingClass}
                onChange={handleExtraChange}
              />
            </label>
            <br />
            <button type="submit">Submit Extra Tasks</button>
          </form>
          <div id="extra-message" className="message">
            {extraMessage}
          </div>
        </section>

        <section className="debuffs">
          <h2>Debuffs</h2>
          <form id="debuffs-form" onSubmit={handleDebuffsSubmit}>
            <label>
              <input
                type="checkbox"
                id="takeaway"
                name="takeaway"
                checked={debuffs.takeaway}
                onChange={handleDebuffsChange}
              />{" "}
              Take aways (-1 Point)
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                id="lateWake"
                name="lateWake"
                checked={debuffs.lateWake}
                onChange={handleDebuffsChange}
              />{" "}
              Wake up after 9am (-1 Point)
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                id="noChore"
                name="noChore"
                checked={debuffs.noChore}
                onChange={handleDebuffsChange}
              />{" "}
              No weekly chore (-1 Point)
            </label>
            <br />
            <button type="submit">Submit Debuffs</button>
          </form>
          <div id="debuffs-message" className="message">
            {debuffsMessage}
          </div>
        </section>
      </main>
    </>
  );
}
