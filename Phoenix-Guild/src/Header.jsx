import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Hold auth instance
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    async function initFirebase() {
      const { initializeApp } = await import(
        "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js"
      );
      const { getAuth, onAuthStateChanged } = await import(
        "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js"
      );

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
      const authInstance = getAuth(app);
      setAuth(authInstance);

      onAuthStateChanged(authInstance, (currentUser) => {
        setUser(currentUser);
      });
    }

    initFirebase();
  }, []);

  const toggleNav = () => setNavOpen((open) => !open);

  const handleSignOut = async () => {
    if (!auth) return;
    const { signOut } = await import(
      "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js"
    );
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <header>
      <div className="logo">🔥 The Phoenix Guild</div>
      <button
        id="nav-toggle"
        aria-label="Toggle navigation"
        onClick={toggleNav}
        type="button"
      >
        &#9776;
      </button>
      <nav>
        <ul id="main-nav" className={navOpen ? "show" : ""}>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "active" : undefined)}
              onClick={() => setNavOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/rankings"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              onClick={() => setNavOpen(false)}
            >
              Rank Calculator
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/history"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              onClick={() => setNavOpen(false)}
            >
              History
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              onClick={() => setNavOpen(false)}
            >
              About
            </NavLink>
          </li>

          {!user ? (
            <>
              <li>
                <NavLink
                  to="/signin"
                  className={({ isActive }) =>
                    isActive ? "active" : undefined
                  }
                  onClick={() => setNavOpen(false)}
                >
                  Sign In
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    isActive ? "active" : undefined
                  }
                  onClick={() => setNavOpen(false)}
                >
                  Sign Up
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive ? "active" : undefined
                  }
                  onClick={() => setNavOpen(false)}
                >
                  Profile
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSignOut();
                    setNavOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
