// RankCalculator.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./assets/rank-calculator.css";

export default function RankCalculator() {
  const location = useLocation();

  // State for inputs
  const [pushups, setPushups] = useState("");
  const [situps, setSitups] = useState("");
  const [plank, setPlank] = useState("");
  const [result, setResult] = useState("");

  const calculateRank = () => {
    const p = parseFloat(pushups);
    const s = parseFloat(situps);
    const pl = parseFloat(plank);

    if (isNaN(p) || p < 0 || isNaN(s) || s < 0 || isNaN(pl) || pl < 0) {
      setResult("Please enter valid non-negative numbers.");
      return;
    }

    // Calculate percentage for each activity relative to the perfect score
    const pushupPct = (p / 1000) * 100;
    const situpPct = (s / 1000) * 100;
    const plankPct = (pl / 10) * 100;

    // Find the lowest percentage (rating)
    const rating = Math.min(pushupPct, situpPct, plankPct);

    // Determine rank zone and multiplier
    let rankZone = "E-Rank (0–25)";
    let multiplier = 1;

    if (rating >= 90) {
      rankZone = "S-Rank (90–100)";
      multiplier = 1.75;
    } else if (rating >= 80) {
      rankZone = "A-Rank (80–90)";
      multiplier = 1.5;
    } else if (rating >= 70) {
      rankZone = "B-Rank (70–80)";
      multiplier = 1.25;
    } else if (rating >= 50) {
      rankZone = "C-Rank (50–70)";
      multiplier = 1.15;
    } else if (rating >= 25) {
      rankZone = "D-Rank (25–50)";
      multiplier = 1.05;
    }

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
  };

  return (
    <>
      <main className="rank-calculator" style={{ padding: "1rem" }}>
        <h1>Rank Calculator</h1>
        <p>
          Enter your daily challenge requirements for the week to calculate your
          Guild Rank and Buffs.
        </p>

        <div className="input-row">
          <input
            type="number"
            id="pushups"
            placeholder="Push-ups"
            min="0"
            value={pushups}
            onChange={(e) => setPushups(e.target.value)}
          />
          <input
            type="number"
            id="situps"
            placeholder="Sit-ups"
            min="0"
            value={situps}
            onChange={(e) => setSitups(e.target.value)}
          />
          <input
            type="number"
            id="plank"
            placeholder="Plank (minutes)"
            min="0"
            step="0.1"
            value={plank}
            onChange={(e) => setPlank(e.target.value)}
          />
        </div>

        <br />
        <button id="calcBtn" onClick={calculateRank}>
          Calculate Rank
        </button>

        <div className="result" id="result" style={{ marginTop: "1rem" }}>
          {result}
        </div>
      </main>
    </>
  );
}
