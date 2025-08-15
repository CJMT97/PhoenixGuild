import React, { useState, useEffect, useRef } from "react";
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

import "./assets/profile.css";

import dragonGif from "./pixelart/Aqua Drake/AquaDrake.gif";
import castle from "./pixelart/castle.png";

const MAX_ENERGY = 10;

async function initCompanionEnergy(userId) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    const lastUpdate = data.lastEnergyUpdate?.toDate().getTime() || Date.now();
    const hoursPassed = Math.floor(
      (Date.now() - lastUpdate) / (1000 * 60 * 60)
    );

    let newEnergy = data.companionEnergy ?? MAX_ENERGY;
    if (hoursPassed > 1) {
      newEnergy = Math.max(newEnergy - hoursPassed, 0);
    }

    await updateDoc(ref, {
      companionEnergy: newEnergy,
      lastEnergyUpdate: serverTimestamp(),
    });

    return newEnergy;
  } else {
    await setDoc(ref, {
      companionEnergy: MAX_ENERGY,
      lastEnergyUpdate: serverTimestamp(),
    });
    return MAX_ENERGY;
  }
}

async function drainCompanionEnergy(userId) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const currentEnergy = snap.data().companionEnergy ?? MAX_ENERGY;
    if (currentEnergy > 0) {
      await updateDoc(ref, {
        companionEnergy: currentEnergy - 1,
        lastEnergyUpdate: serverTimestamp(),
      });
    }
  }
}

export function DragonAvatar({ size = 100 }) {
  const [energy, setEnergy] = useState(0);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const pauseRef = useRef(false);
  const containerRef = useRef(null);
  const userIdRef = useRef(null);

  // Auth listener + energy sync
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        userIdRef.current = user.uid;
        const startingEnergy = await initCompanionEnergy(user.uid);
        setEnergy(startingEnergy);

        // Check every hour and update Firebase
        const hourTimer = setInterval(async () => {
          await drainCompanionEnergy(user.uid);
          setEnergy((prev) => Math.max(prev - 1, 0));
        }, 1000 * 60 * 60);

        return () => clearInterval(hourTimer);
      }
    });
    return unsub;
  }, []);

  // Wandering movement
  useEffect(() => {
    const interval = setInterval(() => {
      if (energy <= 0 || pauseRef.current || !containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const speed = 1 + energy * 0.5;

      setPosition((prev) => {
        let newX = prev.x + direction.x * speed;
        let newY = prev.y + direction.y * speed;

        // Bounce off edges
        if (newX < 0 || newX > containerWidth - size) {
          setDirection((d) => ({ ...d, x: -d.x }));
          newX = Math.max(0, Math.min(containerWidth - size, newX));
        }
        if (newY < 0 || newY > containerHeight - size) {
          setDirection((d) => ({ ...d, y: -d.y }));
          newY = Math.max(0, Math.min(containerHeight - size, newY));
        }

        return { x: newX, y: newY };
      });

      // Random pause
      if (Math.random() < 0.01) {
        pauseRef.current = true;
        setTimeout(() => {
          pauseRef.current = false;
        }, 500 + Math.random() * 1500);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [energy, direction, size]);

  return (
    <>
      {/* Image container */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "400px",
          imageRendering: "pixelated",
          overflow: "hidden",
        }}
      >
        <img
          src={castle}
          alt="Castle Background"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <img
          src={dragonGif}
          alt="Dragon"
          style={{
            position: "absolute",
            left: position.x,
            top: position.y,
            width: size,
            height: size,
            transform: direction.x < 0 ? "scaleX(-1)" : "scaleX(1)",
          }}
        />
      </div>

      {/* Energy bar below the image */}
      <div
        style={{
          width: "80%",
          height: "20px",
          backgroundColor: "#444", // empty bar
          borderRadius: "10px",
          margin: "10px auto 0 auto",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${(energy / MAX_ENERGY) * 100}%`,
            height: "100%",
            backgroundColor: "red",
            transition: "width 0.2s ease",
          }}
        />
        <span
          style={{
            position: "absolute",
            width: "100%",
            textAlign: "center",
            top: 0,
            fontSize: "12px",
            color: "white",
          }}
        >
          Energy
        </span>
      </div>
    </>
  );
}

// Pass the user to the function
const updateCompanionEnergy = async (points, user) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const data = userSnap.data();
  const currentEnergy = data.companionEnergy ?? 10;

  const newEnergy = currentEnergy + points; // no cap in Firebase

  await updateDoc(userRef, {
    companionEnergy: newEnergy,
    lastUpdated: serverTimestamp(),
  });

  return newEnergy; // optional
};

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

  // === Dragon State ===
  const [dragonColor, setDragonColor] = useState("#ff6666");
  const [dragonSize, setDragonSize] = useState(30);
  const [dragonHappiness, setDragonHappiness] = useState(50);
  const [dragonEnergy, setDragonEnergy] = useState(50);

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
          rank: data.lastCalculatedRank?.rankZone || "No rank yet",
          allTimePts: data.points ?? 0,
          weeklyPts: data.weeklyPoints ?? 0,
        });

        // Optionally load dragon state from firestore
        if (data.dragon) {
          setDragonColor(data.dragon.color || "#ff6666");
          setDragonSize(data.dragon.size || 150);
          setDragonHappiness(data.dragon.happiness ?? 50);
          setDragonEnergy(data.dragon.energy ?? 50);
        }
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
      await updateCompanionEnergy(5, currentUser);
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
      await updateCompanionEnergy(totalExtraPts, currentUser);

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

  // Save dragon state to firestore
  const saveDragonState = async (updates) => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      dragon: updates,
      lastUpdated: serverTimestamp(),
    });
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
      await updateCompanionEnergy(debuffPoints, currentUser);

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
        {/* === User Info === */}
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

        {/* === Dragon Companion === */}
        <section className="dragon-companion">
          <h2>Your Dragon Companion</h2>
          <DragonAvatar />

          <p>
            Your companion loves to fly around his castle, but over time he runs
            out of energy. To replenish it, he gains energy from points you
            earn—but don’t worry, this doesn’t affect your weekly point total.
            For every point you gain, his energy is restored by 1/10.
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
