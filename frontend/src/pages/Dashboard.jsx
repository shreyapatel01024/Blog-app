import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareSquare,
} from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscribedBlogs, setSubscribedBlogs] = useState([]);
  const [likes, setLikes] = useState({});
  const [likedPosts, setLikedPosts] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

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

  const fetchSubscribedBlogs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/subscriptions/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscribedBlogs(res.data.blogs || []);
    } catch (err) {
      console.error("❌ Failed to fetch subscribed blogs", err);
      toast.error("Failed to load feed. Please try again.");
    }
  }, [token]);

  const fetchLikes = useCallback(async () => {
    try {
      const likeMap = {};
      const likedByUser = [];

      for (const post of subscribedBlogs) {
        const res = await axios.get(`http://localhost:5000/api/likes/${post._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        likeMap[post._id] = res.data.count || 0;
        if (res.data.likes?.some((like) => like.userId === userId)) {
          likedByUser.push(post._id);
        }
      }

      setLikes(likeMap);
      setLikedPosts(likedByUser);
    } catch (err) {
      console.error("❌ Failed to fetch likes", err);
    }
  }, [subscribedBlogs, userId, token]);

  const renderImage = (image) => {
    if (!image || !image.data || !image.contentType) return null;
    const base64 = btoa(
      new Uint8Array(image.data.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    return `data:${image.contentType};base64,${base64}`;
  };

  const handleLike = async (postId) => {
    try {
      if (!token) return toast.error("Please login to like posts.");

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
      toast.error(err.response?.data?.message || "Failed to toggle like");
    }
  };

  const handleShare = (postId) => {
    const blogLink = `${window.location.origin}/blog/${postId}`;
    navigator.clipboard.writeText(blogLink).then(() => {
      toast.success("🔗 Blog link copied to clipboard!");
    });
  };

  const toggleComments = async (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments((prev) => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        toast.error("Failed to load comments");
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
      toast.error("Failed to post comment.");
    }
  };

  useEffect(() => {
    if (user) fetchSubscribedBlogs();
  }, [user, fetchSubscribedBlogs]);

  useEffect(() => {
    if (subscribedBlogs.length > 0) fetchLikes();
  }, [subscribedBlogs, fetchLikes]);

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="dashboard-wrapper">
        <h2 className="dashboard-title">Welcome, {user.name}</h2>
        <p className="dashboard-email">Email: {user.email}</p>

        <div className="dashboard-blog-box">
          <h3>📢 Blogs from People You Subscribed</h3>
          {subscribedBlogs.length === 0 ? (
            <p>No blogs found from subscriptions.</p>
          ) : (
            subscribedBlogs.map((blog) => (
              <div className="blog-preview" key={blog._id}>
                <div className="blog-author-info">
                  <img
                    src={
                      blog.author?.avatar
                        ? `http://localhost:5000/uploads/avatars/${blog.author.avatar}`
                        : "/avatars/default.png"
                    }
                    alt="avatar"
                    className="mini-avatar"
                    onError={(e) => (e.target.src = "/avatars/default.png")}
                  />
                  <div className="author-text">
                    <span
                      className="author-name"
                      onClick={() => navigate(`/profile/${blog.author?._id}`)}
                      style={{ cursor: "pointer", fontWeight: "bold" }}
                    >
                      {blog.author?.name}
                    </span>
                    <p className="author-email">{blog.author?.email}</p>
                  </div>
                </div>

                <h4>{blog.title}</h4>
                {renderImage(blog.image) && (
                  <img
                    src={renderImage(blog.image)}
                    alt={blog.title}
                    className="blog-image"
                  />
                )}
                <p>
                  {blog.content?.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 100)}...
                </p>
                <small>🕒 {new Date(blog.createdAt).toLocaleString()}</small>

                <div className="blog-actions">
                  <button
                    onClick={() => handleLike(blog._id)}
                    className="icon-btn"
                    title="Like"
                  >
                    {likedPosts.includes(blog._id) ? (
                      <FaHeart color="red" />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>
                  <span className="like-count">({likes[blog._id] || 0})</span>

                  <button
                    className="icon-btn"
                    title="Comment"
                    onClick={() => toggleComments(blog._id)}
                  >
                    <FaCommentDots />
                  </button>

                  <button
                    className="icon-btn"
                    title="Share"
                    onClick={() => handleShare(blog._id)}
                  >
                    <FaShareSquare />
                  </button>
                </div>

                {showComments[blog._id] && (
                  <div className="comments-section">
                    {(comments[blog._id] || []).map((comment) => (
                      <div key={comment._id} className="comment">
                        <p>
                          {(comment.content || comment.text)?.trim() ||
                            "No comment available."}
                        </p>
                      </div>
                    ))}
                    <div className="comment-input">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInputs[blog._id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [blog._id]: e.target.value,
                          }))
                        }
                      />
                      <button onClick={() => handlePostComment(blog._id)}>
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
