import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import "../styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchUserPosts();
    }
  }, [navigate]);

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/posts/my-posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/posts/delete/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const renderImage = (image) => {
    if (!image || !image.data || !image.contentType) return null;
    const base64 = btoa(
      new Uint8Array(image.data.data)
        .reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    return `data:${image.contentType};base64,${base64}`;
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <h2>Your Profile</h2>
        <div className="profile-card">
          <img
            src={
              user.avatar
                ? `http://localhost:5000/uploads/avatars/${user.avatar}`
                : "/default-avatar.png"
            }
            alt="avatar"
            className="avatar-img"
          />
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>

        <div className="profile-blogs">
          <h3>Your Blogs</h3>
          {posts.length === 0 ? (
            <p>No blogs posted yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="blog-card">
                <h4>{post.title}</h4>
                {renderImage(post.image) && (
                  <img
                    src={renderImage(post.image)}
                    alt={post.title}
                    className="blog-image"
                  />
                )}
                <p>{post.content.slice(0, 100)}...</p>
                <p><small>{new Date(post.createdAt).toLocaleString()}</small></p>
                <button className="delete-btn" onClick={() => handleDelete(post._id)}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
