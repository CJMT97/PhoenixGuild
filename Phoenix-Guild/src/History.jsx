// History.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function History() {
  const location = useLocation();

  return (
    <>
      <main style={{ padding: "1rem" }}>
        <h1>History</h1>
        <p>This page is currently empty. Content coming soon!</p>
      </main>
    </>
  );
}
