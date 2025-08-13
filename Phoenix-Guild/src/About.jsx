// About.jsx
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./assets/about.css";

export default function About() {
  const location = useLocation();

  return (
    <>
      <main style={{ padding: "1rem" }}>
        <h1>About – Rating & Rank Buffs</h1>

        <h2>Rating Calculation</h2>
        <p>
          A perfect rating of <strong>100</strong> requires:{" "}
          <strong>1000 push-ups</strong>, <strong>1000 sit-ups</strong>, and a{" "}
          <strong>10-minute plank</strong> in the week.
        </p>
        <p>
          Your rating is determined by the <strong>lowest percentage</strong> of
          completion across the three activities.
        </p>
        <p>
          <em>Example 1:</em> 300 push-ups, 300 sit-ups, and a 3-minute plank →
          All at 30% of the target → Rating: <strong>30</strong>
        </p>
        <p>
          <em>Example 2:</em> 400 push-ups, 225 sit-ups, and a 5-minute plank →
          Lowest is sit-ups (22.5%) → Rating: <strong>22.5</strong>
        </p>

        <h2>Rank Zones & Buffs</h2>
        <div className="rank-zone">
          <strong>S-Rank (90–100):</strong> ×1.75 to all Daily Challenge Points
        </div>
        <div className="rank-zone">
          <strong>A-Rank (80–90):</strong> ×1.5 to all Daily Challenge Points
        </div>
        <div className="rank-zone">
          <strong>B-Rank (70–80):</strong> ×1.25 to all Daily Challenge Points
        </div>
        <div className="rank-zone">
          <strong>C-Rank (50–70):</strong> ×1.15 to all Daily Challenge Points
        </div>
        <div className="rank-zone">
          <strong>D-Rank (25–50):</strong> ×1.05 to all Daily Challenge Points
        </div>
        <div className="rank-zone">
          <strong>E-Rank (0–25):</strong> No Buffs
        </div>

        <h2>
          Daily Requirements <small>(Worth 5 Points)</small>
        </h2>
        <ul>
          <li>
            <strong>Jasper:</strong> x Push-ups, x Sit-ups, x Plank
          </li>
          <li>
            <strong>Charlie:</strong> 50 Push-ups, 50 Sit-ups, 1 min Plank
            (E-Rank)
          </li>
        </ul>
        <p>
          <em>Due by 11:59 pm each day</em>. Missing the requirement results in
          a <strong>5% cumulative penalty</strong> on your weekly total.
        </p>
        <p>
          Requirements can only be changed once a week on Monday morning—choose
          wisely. Video proof may be required.
        </p>

        <h2>Weekly Bonuses</h2>
        <p>
          To be decided by the group. Submission deadline:{" "}
          <strong>Sunday 11:59 pm</strong>.
        </p>

        <h2>General Point System</h2>
        <ul>
          <li>1 km run/walk = 1 point (round down, excludes cycling)</li>
          <li>Gym session = 1 point (round down to nearest 45 min)</li>
          <li>
            30 min competitive sport = 1 point (round down to nearest 30 min)
          </li>
          <li>Cycling class at Unipol = Points TBD</li>
        </ul>

        <h2>Debuffs</h2>
        <ul>
          <li>Takeaway food = −1 point</li>
          <li>Waking up after 9 am = −1 point</li>
          <li>Missing weekly chore = −1 point</li>
        </ul>

        <h2>Weight Loss Bonus</h2>
        <p>
          Extra points per kilogram lost (details TBD). Perfect for those on a
          cut.
        </p>
      </main>
    </>
  );
}
