import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./assets/firebase-config"; // <-- path relative to your component
import { useNavigate, Link } from "react-router-dom";
import "./assets/signin.css";
import "./assets/styles.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error) {
      setErrorMsg(error.message || "Failed to sign in");
    }
  };

  return (
    <>
      <main>
        <div className="container">
          <h2>Sign In - Phoenix Guild</h2>
          <form id="signin-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">Sign In</button>
          </form>
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
          {errorMsg && <div className="error">{errorMsg}</div>}
        </div>
      </main>
    </>
  );
}
