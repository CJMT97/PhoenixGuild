// WeeklyRequirements.jsx
import React, { useState, useEffect } from "react";
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
import "./assets/rank-calculator.css";

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

export default function WeeklyRequirements() {
  const [userId, setUserId] = useState(null);

  const [pushups, setPushups] = useState("");
  const [situps, setSitups] = useState("");
  const [plank, setPlank] = useState("");
  const [result, setResult] = useState("");
  const [lastWeekSubmitted, setLastWeekSubmitted] = useState(null);
  const [canEdit, setCanEdit] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const ref = doc(db, "users", user.uid, "weeklyRequirements", "current");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setPushups(data.pushups ?? "");
          setSitups(data.situps ?? "");
          setPlank(data.plank ?? "");

          if (data.lastSubmitted) {
            const last = data.lastSubmitted.toDate();
            setLastWeekSubmitted(getWeekNumber(last));
            const currentWeek = getWeekNumber(new Date());
            if (currentWeek === getWeekNumber(last)) {
              setCanEdit(false); // already submitted this week
            }
          }
        }
      } else {
        setUserId(null);
      }
    });
    return unsub;
  }, []);

  const submitWeeklyRequirements = async () => {
    if (!canEdit) {
      setResult("You can only submit once per week.");
      return;
    }

    const p = parseFloat(pushups);
    const s = parseFloat(situps);
    const pl = parseFloat(plank);

    if (isNaN(p) || p < 0 || isNaN(s) || s < 0 || isNaN(pl) || pl < 0) {
      setResult("Please enter valid non-negative numbers.");
      return;
    }

    if (userId) {
      const reqRef = doc(db, "users", userId, "weeklyRequirements", "current");
      const rankRef = doc(db, "users", userId); // store rank at top-level user doc
      const now = new Date();
      await setDoc(reqRef, {
        pushups: p,
        situps: s,
        plank: pl,
        lastSubmitted: now,
      });
      setLastWeekSubmitted(getWeekNumber(now));
      setCanEdit(false);

      // Calculate rank
      const pushupPct = (p / 1000) * 100;
      const situpPct = (s / 1000) * 100;
      const plankPct = (pl / 10) * 100;
      const rating = Math.min(pushupPct, situpPct, plankPct);

      let rankZone = "E-Rank (0–5)";
      let multiplier = 1;

      if (rating >= 75) {
        rankZone = "S-Rank (75–100)";
        multiplier = 2;
      } else if (rating >= 50) {
        rankZone = "A-Rank (50–75)";
        multiplier = 1.75;
      } else if (rating >= 20) {
        rankZone = "B-Rank (20–50)";
        multiplier = 1.5;
      } else if (rating >= 10) {
        rankZone = "C-Rank (10–20)";
        multiplier = 1.25;
      } else if (rating >= 5) {
        rankZone = "D-Rank (5–10)";
        multiplier = 1.15;
      }

      // Save the rank in user doc (not in weeklyRequirements)
      await updateDoc(rankRef, {
        lastCalculatedRank: {
          rating,
          rankZone,
          multiplier,
          calculatedAt: serverTimestamp(),
        },
      });

      setResult(
        <>
          <p>
            Your rating: <strong>{rating.toFixed(1)}</strong>
          </p>
          <p>
            Rank Zone: <strong>{rankZone}</strong>
          </p>
          <p>
            Points multiplier: <strong>{multiplier}×</strong>
          </p>
        </>
      );
    }
  };

  return (
    <main className="rank-calculator" style={{ padding: "1rem" }}>
      <h1>Weekly Requirements</h1>
      <p>
        Enter your weekly challenge goals. Your rank will be calculated below.
      </p>

      <div className="input-row">
        <input
          type="number"
          placeholder="Push-ups"
          min="0"
          value={pushups}
          onChange={(e) => setPushups(e.target.value)}
          disabled={!canEdit}
        />
        <input
          type="number"
          placeholder="Sit-ups"
          min="0"
          value={situps}
          onChange={(e) => setSitups(e.target.value)}
          disabled={!canEdit}
        />
        <input
          type="number"
          placeholder="Plank (minutes)"
          min="0"
          step="0.1"
          value={plank}
          onChange={(e) => setPlank(e.target.value)}
          disabled={!canEdit}
        />
      </div>

      <br />
      <button onClick={submitWeeklyRequirements} disabled={!canEdit}>
        Submit Weekly Requirements
      </button>

      {!canEdit && lastWeekSubmitted !== null && (
        <p style={{ marginTop: "0.5rem", color: "gray" }}>
          You've already submitted this week. You can submit again next Monday.
        </p>
      )}

      <div className="result" style={{ marginTop: "1rem" }}>
        {result}
      </div>
    </main>
  );
}
