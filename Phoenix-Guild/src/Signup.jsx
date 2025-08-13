import React, { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

import "./assets/signup.css"; // Import the CSS file here

// Your Firebase config & initialization (same as before)

const firebaseConfig = {
  apiKey: "AIzaSyCy-a9fSGbt70MLUfH_Xg4cSXThyU7USv8",
  authDomain: "phenoixguild.firebaseapp.com",
  projectId: "phenoixguild",
  storageBucket: "phenoixguild.firebasestorage.app",
  messagingSenderId: "829936465872",
  appId: "1:829936465872:web:f01fbd13792a2ea663abd5",
  measurementId: "G-Y1GYT3N2H7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function SignUp() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.email) return "Email is required.";
    if (!form.password || form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (!form.name) return "Name is required.";
    const ageNum = parseInt(form.age, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120)
      return "Age must be a number between 13 and 120.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: form.name.trim(),
        age: parseInt(form.age, 10),
        email: form.email,
        createdAt: new Date(),
      });

      alert("Signup successful! You can now log in.");
      setForm({ email: "", password: "", name: "", age: "" });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="container">
      <h2>Sign Up - Phoenix Guild</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />

        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="age">Age:</label>
        <input
          id="age"
          type="number"
          name="age"
          value={form.age}
          onChange={handleChange}
          required
          min={13}
          max={120}
        />

        <button type="submit">Sign Up</button>
      </form>

      {error && <div className="error">{error}</div>}
    </main>
  );
}
