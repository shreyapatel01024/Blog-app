// SearchPage.js - Fully Updated with Live Comments
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Search.css";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareSquare,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [likes, setLikes] = useState({});
  const [likedPosts, setLikedPosts] = useState([]);
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const loggedInUserId = localStorage.getItem("userId");

  const fetchLikes = useCallback(async (blogsToCheck) => {
    try {
      const likeMap = {};
      const likedByUser = [];

      for (const blog of blogsToCheck) {
        const res = await axios.get(`http://localhost:5000/api/likes/${blog._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        likeMap[blog._id] = res.data.count || 0;

        const alreadyLiked = res.data.likes.some((like) => like.userId === loggedInUserId);
        if (alreadyLiked) likedByUser.push(blog._id);
      }

      setLikes(likeMap);
      setLikedPosts(likedByUser);
    } catch (err) {
      console.error("❌ Failed to fetch likes", err);
      toast.error("Failed to fetch likes");
    }
  }, [loggedInUserId, token]);

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/comments/${postId}`);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const handleToggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) fetchComments(postId);
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

      const newComment = res.data;

      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("❌ Failed to post comment", err);
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
      console.error("Failed to delete comment", err);
    }
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

  const renderImage = (image) => {
    if (!image || !image.data || !image.contentType) return null;
    const base64 = btoa(
      new Uint8Array(image.data.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    return `data:${image.contentType};base64,${base64}`;
  };

  const handleSearch = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/search/blogs?q=${query}`);
      if (res.data.length === 0) {
        const userRes = await axios.get(`http://localhost:5000/api/search/user?q=${query}`);
        setUserProfile(userRes.data.user);
        setBlogs(userRes.data.userBlogs || []);
      } else {
        setUserProfile(null);
        setBlogs(res.data);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setBlogs([]);
      setUserProfile(null);
    }
  }, [query]);

  useEffect(() => {
    if (query.trim()) {
      const delay = setTimeout(() => handleSearch(), 500);
      return () => clearTimeout(delay);
    }
  }, [query, handleSearch]);

  useEffect(() => {
    const fetchRandomBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/search/random");
        setBlogs(res.data || []);
        setUserProfile(null);
        fetchLikes(res.data);
      } catch (err) {
        console.error("Failed to fetch random blogs", err);
      }
    };

    if (!query.trim()) fetchRandomBlogs();
  }, [query, fetchLikes]);

  return (
    <>
      <Navbar />
      <div className="search-page">
        <input
          type="text"
          placeholder="🔍 Search blogs or users by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />

        {userProfile && (
          <div className="user-public-profile" onClick={() => navigate(`/profile/${userProfile._id}`)}>
            <img src={`http://localhost:5000/uploads/avatars/${userProfile.avatar}`} alt="avatar" />
            <div className="user-info">
              <h2>{userProfile.name}</h2>
              <p>{userProfile.email}</p>
              <p>📝 Blogs: {userProfile.totalBlogs}</p>
              <p>🤝 Subscribers: {userProfile.totalSubscribers}</p>
            </div>
          </div>
        )}

        <div className="blog-results">
          {blogs.length === 0 && query.trim() !== "" && !userProfile && (
            <p className="no-results">🚫 No blogs found.</p>
          )}

          {blogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              <div className="blog-header">
                <div className="author-info">
                  <img
                    src={`http://localhost:5000/uploads/avatars/${blog.author?.avatar}`}
                    alt="avatar"
                    className="mini-avatar"
                  />
                  <div>
                    <span className="author-name" onClick={() => navigate(`/profile/${blog.author?._id}`)}>
                      {blog.author?.name}
                    </span>
                    <p>{blog.author?.email}</p>
                  </div>
                </div>
              </div>

              {renderImage(blog.image) && (
                <img src={renderImage(blog.image)} alt={blog.title} className="blog-image" />
              )}

              <h3 className="blog-title">{blog.title}</h3>
              <p className="blog-snippet">
                {blog.content?.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 120)}...
              </p>

              <div className="blog-actions">
                <button onClick={() => handleLike(blog._id)} className="icon-btn" title="Like">
                  {likedPosts.includes(blog._id) ? <FaHeart color="red" /> : <FaRegHeart />}
                </button>
                <span className="like-count">({likes[blog._id] || 0})</span>

                <button className="icon-btn" onClick={() => handleToggleComments(blog._id)} title="Comment">
                  <FaCommentDots />
                </button>

                <button
                  className="icon-btn"
                  title="Share"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/blog/${blog._id}`);
                    toast.success("🔗 Blog link copied!");
                  }}
                >
                  <FaShareSquare />
                </button>
              </div>

              {showComments[blog._id] && (
                <div className="comments-section">
                  <div className="comments-list">
                    {(comments[blog._id] || []).map((comment) => (
                      <div
                        key={comment._id || Math.random()}
                        className={`comment ${
                          comment.author?._id === loggedInUserId ? "comment-own" : "comment-other"
                        }`}
                      >
                        <p>
                          <strong>{comment.author?.name || "User"}:</strong> {comment.content}
                        </p>
                        {comment.author?._id === loggedInUserId && (
                          <FaTrash
                            className="delete-comment"
                            onClick={() => handleDeleteComment(comment._id, blog._id)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="comment-input">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInputs[blog._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [blog._id]: e.target.value }))
                      }
                    />
                    <button onClick={() => handlePostComment(blog._id)}>Post</button>
                  </div>
                </div>
              )}

              <div className="blog-tags">
                {blog.tags?.map((tag, idx) => (
                  <span className="tag" key={`${blog._id}-${idx}`}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;