import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthUser, logoutUser } from "../services/courseService";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="Navbar-container">
      <Link to="/" className="logo">
        CourseX
      </Link>

      {/* Hamburger / Close icon */}
      <div className="hamburger" onClick={toggleMenu}>
        {menuOpen ? "✖" : "☰"}
      </div>

      {/* Menu */}
      <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
        <div className="Navbar-links">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/my-courses" onClick={closeMenu}>MyCourses</Link>
          {user?.isAdmin && (
            <Link to="/admin" onClick={closeMenu}>Admin</Link>
          )}
        </div>

        <div className="navbar-Login">
          {user ? (
            <>
              <span className="username">Hi, {user.name}</span>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>Login</Link>
              <Link to="/signup" onClick={closeMenu}>Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}