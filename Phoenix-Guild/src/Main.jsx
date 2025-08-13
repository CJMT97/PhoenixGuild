import React from "react";
import { Link } from "react-router-dom";

export default function Main() {
  return (
    <main>
      <section className="hero">
        <h1>Awaken Your Power</h1>
        <p>
          Step into the challenge. Rise through the ranks, earn rewards, and
          dominate the fitness battlefield with your friends.
        </p>
        <Link to="/rankings" className="cta-button">
          Enter the Guild
        </Link>
      </section>

      <section className="features">
        <div className="feature">
          <h2>🏆 Compete Weekly</h2>
          <p>Train hard, earn points, and prove your worth every week.</p>
        </div>
        <div className="feature">
          <h2>⚔️ Climb the Leaderboard</h2>
          <p>Face your rivals and rise to the top of the guild rankings.</p>
        </div>
        <div className="feature">
          <h2>💎 Earn Legendary Rewards</h2>
          <p>Push past your limits and claim the rewards you deserve.</p>
        </div>
      </section>
    </main>
  );
}
