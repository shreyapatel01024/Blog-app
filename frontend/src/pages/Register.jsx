import React, { useState } from "react";
import axios from "axios";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const avatarOptions = [
  "avatar1.png",
  "avatar2.png",
  "avatar3.png",
  "avatar4.png",
  "avatar5.png",
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatarSource: "list", // "list" or "upload"
    selectedAvatar: avatarOptions[0],
    avatarFile: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (avatar) => {
    setForm({ ...form, selectedAvatar: avatar });
  };

  const handleAvatarFileChange = (e) => {
    setForm({ ...form, avatarFile: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("email", form.email);
    data.append("password", form.password);
    data.append("role", "user"); // Always user

    if (form.avatarSource === "upload" && form.avatarFile) {
      data.append("avatar", form.avatarFile);
    } else {
      data.append("avatar", form.selectedAvatar); // just send the file name
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", data);
      toast.success("Registration successful!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-card" encType="multipart/form-data">
        <h2>Register</h2>

        <input className="auth-input" name="name" onChange={handleChange} placeholder="Name" required />
        <input className="auth-input" name="email" type="email" onChange={handleChange} placeholder="Email" required />
        <input className="auth-input" name="password" type="password" onChange={handleChange} placeholder="Password" required />

        <div className="avatar-source-toggle">
          <label>
            <input
              type="radio"
              name="avatarSource"
              value="list"
              checked={form.avatarSource === "list"}
              onChange={handleChange}
            />
            Select from Avatar List
          </label>
          <label>
            <input
              type="radio"
              name="avatarSource"
              value="upload"
              checked={form.avatarSource === "upload"}
              onChange={handleChange}
            />
            Upload from Memory
          </label>
        </div>

       {form.avatarSource === "list" ? (
  <div className="avatar-selection">
    <p>Select an avatar:</p>
    <div className="avatar-grid">
      {avatarOptions.map((avatar) => (
        <img
          key={avatar}
          src={`/avatars/${avatar}`}
          alt={avatar}
          className={`avatar-option ${form.selectedAvatar === avatar ? "selected" : ""}`}
          onClick={() => handleAvatarSelect(avatar)}
        />
      ))}
    </div>
  </div>
) : (
  <input type="file" accept="image/*" onChange={handleAvatarFileChange} required />
)}


        <button type="submit">Register</button>

        <p>
          Already have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/login")}>
            Login here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
