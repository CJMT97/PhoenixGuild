import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Main from "./Main";
import Rankings from "./Rankings"; // You'll create this page later
import History from "./History"; // You'll create this page later
import About from "./About"; // You'll create this page later
import Footer from "./Footer";
import SignIn from "./Signin"; // Adjust path accordingly
import Profile from "./Profile";
import Signup from "./Signup";
import Groups from "./Groups";

import "./assets/styles.css";

export default function App() {
  return (
    <Router basename="PhoenixGuild">
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/history" element={<History />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/groups" element={<Groups />} />
      </Routes>
      <Footer />
    </Router>
  );
}
