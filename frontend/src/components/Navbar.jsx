// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">Blog App</h1>

        <div className="navbar-buttons">
          {user.role === "admin" ? (
            <>
              <Link to="/admindashboard" className="navbar-link">Admin Home</Link>
              <Link to="/adminsearch" className="navbar-link">Search</Link>
              <Link to="/adminprofile" className="navbar-link">Profile</Link>
              <button className="navbar-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="navbar-link">Home</Link>
              <Link to="/add-blog" className="navbar-link">Add Blog</Link>
              <Link to="/search" className="navbar-link">Search</Link>
              <Link to="/profile" className="navbar-link">Profile</Link>
              <button className="navbar-button" onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
