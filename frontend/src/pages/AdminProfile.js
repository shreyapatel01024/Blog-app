// src/pages/AdminProfile.jsx
import React, { useState } from "react";
import "../styles/AdminProfile.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { toast } from "react-toastify";

const AdminProfile = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const token = localStorage.getItem("token");

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedAvatar(file);
        setPreviewAvatar(URL.createObjectURL(file));
        setShowPopup(true);
      }
    };
    input.click();
  };

  const handleConfirmUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("avatar", selectedAvatar);

      const res = await axios.put("http://localhost:5000/api/users/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = { ...user, avatar: res.data.avatar };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowPopup(false);
      toast.success("✅ Avatar updated!");
    } catch (err) {
      console.error("Failed to update avatar:", err);
      toast.error("❌ Failed to update avatar.");
    }
  };

  const handleCancelUpload = () => {
    setSelectedAvatar(null);
    setPreviewAvatar("");
    setShowPopup(false);
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <h2>Admin Profile</h2>
        <div className="profile-card">
          <div className="avatar-wrapper" onClick={handleAvatarClick}>
            <img
              src={
                previewAvatar
                  ? previewAvatar
                  : user.avatar?.startsWith("avatar")
                  ? `/avatars/${user.avatar}`
                  : user.avatar
                  ? `http://localhost:5000/uploads/avatars/${user.avatar}`
                  : "/default-avatar.png"
              }
              alt="Admin Avatar"
              className="avatar-img"
            />
            <span className="avatar-edit-icon">+</span>
          </div>
          <div>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-box">
              <p>Confirm avatar update?</p>
              <div className="popup-buttons">
                <button className="confirm" onClick={handleConfirmUpload}>Confirm</button>
                <button className="cancel" onClick={handleCancelUpload}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminProfile;
