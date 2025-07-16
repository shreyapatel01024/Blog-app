// src/components/Navbar.js

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
    <header className="custom-navbar">
      <div className="navbar-left">
        <h1 className="navbar-logo">✍️ Blogify</h1>
      </div>
      <nav className="navbar-right">
        {user.role === "admin" ? (
          <>
            <Link to="/admindashboard" className="nav-link">Home</Link>
            <Link to="/adminsearch" className="nav-link">Search</Link>
            <Link to="/adminprofile" className="nav-link">Profile</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="nav-link">Home</Link>
            <Link to="/search" className="nav-link">Search</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/add-blog" className="add-blog-button" title="Add Blog">
              ➕
            </Link>
          </>
        )}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
