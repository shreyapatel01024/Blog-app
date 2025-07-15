import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/AdminSearch.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminSearch = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [likesMap, setLikesMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [showComments, setShowComments] = useState({});
  const token = localStorage.getItem("token");
  // const userId = localStorage.getItem("userId");
  const BACKEND_URL = "http://localhost:5000";

  const fetchBlogs = useCallback(async () => {
    if (!token) return console.warn("🔒 No token found. Admin access required.");

    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch blogs:", err);
    }
  }, [token]);

  const fetchBlogStats = useCallback(async () => {
    const likes = {};
    const comments = {};

    await Promise.all(
      blogs.map(async (blog) => {
        try {
          const likeRes = await axios.get(
            `${BACKEND_URL}/api/likes/${blog._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          likes[blog._id] = likeRes.data.count || 0;

          const commentRes = await axios.get(
            `${BACKEND_URL}/api/comments/${blog._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          comments[blog._id] = commentRes.data || [];
        } catch (err) {
          console.error(`Failed to fetch stats for blog ${blog._id}:`, err);
        }
      })
    );

    setLikesMap(likes);
    setCommentsMap(comments);
  }, [blogs, token]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (blogs.length > 0) fetchBlogStats();
  }, [blogs, fetchBlogStats]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/posts/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete blog:", err);
    }
  };

  const handleDeleteComment = async (commentId, blogId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentsMap((prev) => ({
        ...prev,
        [blogId]: prev[blogId].filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      console.error("❌ Failed to delete comment:", err);
    }
  };

  const bufferToBase64 = (buffer) => {
    try {
      return btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
    } catch (err) {
      console.error("❌ Image decoding failed:", err);
      return null;
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <>
      <Navbar />
      <div className="admin-search-container">
        <input
          type="text"
          placeholder="🔍 Search blogs by title or tags..."
          className="admin-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="blogs-wrapper">
          {filteredBlogs.map((blog) => (
            <div className="blog-card" key={blog._id}>
              <div className="blog-card-header">
                <div className="author-info">
                  <img
                    src={
                      blog.author?.avatar?.startsWith("avatar")
                        ? `/avatars/${blog.author.avatar}`
                        : `${BACKEND_URL}/uploads/avatars/${blog.author?.avatar || "default.png"}`
                    }
                    alt="avatar"
                    className="avatar"
                    onError={(e) => (e.target.src = "/avatars/default.png")}
                  />
                  <div className="name-email">
                    <span className="name">{blog.author?.name}</span>
                    <span className="email">{blog.author?.email}</span>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => handleDelete(blog._id)}>
                  🗑️
                </button>
              </div>

              <h4 className="blog-title">{blog.title}</h4>

              {blog.image?.data?.data && blog.image?.contentType && (
                <img
                  src={`data:${blog.image.contentType};base64,${bufferToBase64(blog.image.data.data)}`}
                  alt="blog"
                  className="blog-image"
                />
              )}

              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              <div className="blog-stats">
                <span className="stat">👍 {likesMap[blog._id] || 0} Likes</span>
                <span className="stat">💬 {commentsMap[blog._id]?.length || 0} Comments</span>
                <button onClick={() => toggleComments(blog._id)} className="show-comments-btn">
                  {showComments[blog._id] ? "Hide Comments" : "Show Comments"}
                </button>
              </div>

              {showComments[blog._id] && (
                <div className="comment-list">
                  {commentsMap[blog._id]?.length > 0 ? (
                    commentsMap[blog._id].map((c) => (
                      <div key={c._id} className="admin-comment">
                        <p>
                          <strong>{c.author?.name || "User"}:</strong> {c.content}
                        </p>
                        <button
                          className="delete-comment-btn"
                          onClick={() => handleDeleteComment(c._id, blog._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-comments">No comments yet.</p>
                  )}
                </div>
              )}

              <div className="tags">
                {blog.tags?.map((tag, idx) => (
                  <span className="tag" key={idx}>
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

export default AdminSearch;
