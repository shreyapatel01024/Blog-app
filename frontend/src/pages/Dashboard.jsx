import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error("Please login to access the dashboard");
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      toast.success(`Welcome back, ${parsedUser.name}!`);
    }
  }, [navigate]);

  if (!user) return null; // Wait until user is loaded

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper">
        <h2 className="dashboard-title">Welcome, {user.name}</h2>
        <p className="dashboard-email">Email: {user.email}</p>

        <div className="dashboard-blog-box">
          <h3>Your Blogs Will Appear Here</h3>
          <p>Create and manage your blog posts</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
