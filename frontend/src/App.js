// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import AdminProfile from "./pages/AdminProfile";
import AddBlog from "./pages/AddBlog";
import SearchPage from "./pages/SearchPage";
import AdminSearch from "./pages/AdminSearch";
import UserPublicProfile from "./pages/UserPublicProfile";

function App() {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const user = localStorage.getItem("user");
  const role = user ? JSON.parse(user).role : null;

  return (
    <BrowserRouter>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Routes>
        {/* Redirect root path based on auth */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? role === "admin"
                ? <Navigate to="/admindashboard" />
                : <Navigate to="/dashboard" />
              : <Navigate to="/login" />
          }
        />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            isAuthenticated
              ? role === "admin"
                ? <Navigate to="/admindashboard" />
                : <Dashboard />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admindashboard"
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/adminprofile"
          element={isAuthenticated ? <AdminProfile /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-blog"
          element={isAuthenticated ? <AddBlog /> : <Navigate to="/login" />}
        />
        <Route
          path="/search"
          element={isAuthenticated ? <SearchPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/adminsearch"
          element={isAuthenticated ? <AdminSearch /> : <Navigate to="/login" />}
        />

        <Route path="/profile/:id" element={<UserPublicProfile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
