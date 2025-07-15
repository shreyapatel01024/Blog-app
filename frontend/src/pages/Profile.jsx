import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import "../styles/Profile.css";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareSquare,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [likedPosts, setLikedPosts] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const fetchUserPosts = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/my-posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  }, [token]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchUserPosts();
    }
  }, [navigate, fetchUserPosts]);
const fetchLikes = useCallback(async () => {
  try {
    const likeMap = {};
    const likedByUser = [];

    for (const post of posts) {
      const res = await axios.get(`http://localhost:5000/api/likes/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Add this
      });

      likeMap[post._id] = res.data.count || 0;
      if (res.data.likes.some((like) => like.userId === userId)) {
        likedByUser.push(post._id);
      }
    }

    setLikes(likeMap);
    setLikedPosts(likedByUser);
  } catch (err) {
    console.error("❌ Failed to fetch likes", err);
  }
}, [posts, userId, token]);


  const handleLike = async (postId) => {
    if (!token) return toast.error("Please login to like posts.");
    try {
      await axios.post(
        "http://localhost:5000/api/likes",
        { postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const isLiked = likedPosts.includes(postId);
      const updatedCount = isLiked ? likes[postId] - 1 : likes[postId] + 1;

      setLikes((prev) => ({ ...prev, [postId]: updatedCount }));
      setLikedPosts((prev) =>
        isLiked ? prev.filter((id) => id !== postId) : [...prev, postId]
      );

      toast.success(isLiked ? "💔 Post unliked!" : "❤️ Post liked!");
    } catch (err) {
      console.error("❌ Like failed", err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/delete/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const renderImage = (image) => {
    if (!image?.data?.data || !image.contentType) return null;
    const base64 = btoa(
      new Uint8Array(image.data.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    return `data:${image.contentType};base64,${base64}`;
  };

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
      toast.error("Avatar upload failed");
    }
  };

  const handleCancelUpload = () => {
    setSelectedAvatar(null);
    setPreviewAvatar("");
    setShowPopup(false);
  };

  const toggleComments = async (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${postId}`);
        setComments((prev) => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    }
  };

  const handlePostComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return toast.warn("Comment cannot be empty.");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/comments",
        { postId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data],
      }));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Failed to post comment:", err);
      toast.error("Failed to post comment.");
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  useEffect(() => {
    if (posts.length > 0) fetchLikes();
  }, [posts, fetchLikes]);

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <h2>Your Profile</h2>
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
              alt="avatar"
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

        <div className="profile-blogs">
          <h3>Your Blogs</h3>
          {posts.length === 0 ? (
            <p>No blogs posted yet.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="blog-card">
                <h4>{post.title}</h4>
                {renderImage(post.image) && (
                  <img src={renderImage(post.image)} alt={post.title} className="blog-image" />
                )}
                <p>{post.content.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 100)}...</p>
                <p><small>{new Date(post.createdAt).toLocaleString()}</small></p>

                <div className="blog-actions">
                  <button className="icon-btn" onClick={() => handleLike(post._id)}>
                    {likedPosts.includes(post._id) ? <FaHeart color="red" /> : <FaRegHeart />}
                  </button>
                  <span className="like-count">({likes[post._id] || 0})</span>
                  <button className="icon-btn" onClick={() => toggleComments(post._id)}>
                    <FaCommentDots />
                  </button>
                  <button className="icon-btn"><FaShareSquare /></button>
                </div>

                {showComments[post._id] && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {(comments[post._id] || []).map((comment) => (
                        <div className="comment" key={comment._id}>
                          <p><strong>{comment.author?.name || "User"}:</strong> {comment.content}</p>
                          <FaTrash
                            className="delete-comment"
                            onClick={() => handleDeleteComment(comment._id, post._id)}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="comment-input">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInputs[post._id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post._id]: e.target.value,
                          }))
                        }
                      />
                      <button onClick={() => handlePostComment(post._id)}>Post</button>
                    </div>
                  </div>
                )}

                <button className="delete-btn" onClick={() => handleDeletePost(post._id)}>
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
