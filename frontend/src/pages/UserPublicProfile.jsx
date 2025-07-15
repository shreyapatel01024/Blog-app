// src/pages/UserPublicProfile.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/UserPublicProfile.css";
import {
  FaHeart,
  FaRegHeart,
  FaCommentDots,
  FaShareSquare,
  FaTrash,
  FaReply,
} from "react-icons/fa";
import { toast } from "react-toastify";

const UserPublicProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [likes, setLikes] = useState({});
  const [likedPosts, setLikedPosts] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [replyingTo, setReplyingTo] = useState({});

  const token = localStorage.getItem("token");
  const loggedInUserId = localStorage.getItem("userId");

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${id}`);
      setUser(res.data.user);
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error("❌ Failed to load user profile", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchLikes = useCallback(async () => {
    try {
      const likeMap = {};
      const likedByUser = [];

      for (const blog of blogs) {
        const res = await axios.get(`http://localhost:5000/api/likes/${blog._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        likeMap[blog._id] = res.data.count || 0;
        if (res.data.likes.some((like) => like.userId === loggedInUserId)) {
          likedByUser.push(blog._id);
        }
      }

      setLikes(likeMap);
      setLikedPosts(likedByUser);
    } catch (err) {
      console.error("❌ Failed to fetch likes", err);
      toast.error("❌ Failed to load likes");
    }
  }, [blogs, loggedInUserId, token]);

  const checkSubscription = useCallback(async () => {
    if (!token || loggedInUserId === id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/subscriptions/check/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSubscribed(res.data.isSubscribed);
    } catch (err) {
      console.error("❌ Subscription check failed", err);
    }
  }, [id, token, loggedInUserId]);

  const handleSubscribe = async () => {
    if (loggedInUserId === id) return toast.error("You cannot subscribe to yourself!");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/subscriptions/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newStatus = res.data.isSubscribed;
      setIsSubscribed(newStatus);
      setUser((prev) => ({
        ...prev,
        totalSubscribers: newStatus
          ? prev.totalSubscribers + 1
          : Math.max(0, prev.totalSubscribers - 1),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Subscription failed");
    }
  };

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
    } catch (err) {
      toast.error("Failed to like post.");
    }
  };

  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/blog/${postId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast.success("🔗 Blog link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link."));
  };

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

  const toggleComments = async (postId) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
      toast.error("Failed to post comment.");
    }
  };

  const handleReply = async (postId, parentId) => {
    const content = replyInputs[parentId];
    if (!content?.trim()) return toast.warn("Reply cannot be empty.");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/comments",
        { postId, content, parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => ({
        ...prev,
        [postId]: [...prev[postId], res.data],
      }));
      setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
      setReplyingTo((prev) => ({ ...prev, [postId]: null }));
    } catch (err) {
      toast.error("Failed to reply.");
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
      toast.error("Failed to delete comment.");
    }
  };

  const renderComments = (postId) => {
    const grouped = (comments[postId] || []).reduce((acc, comment) => {
      const parent = comment.parentId || "root";
      acc[parent] = acc[parent] || [];
      acc[parent].push(comment);
      return acc;
    }, {});

    const getAuthorName = (id) => {
      const allComments = comments[postId] || [];
      const parent = allComments.find((c) => c._id === id);
      return parent?.author?.name || "User";
    };

    const renderReplies = (parentId, level = 0) =>
      (grouped[parentId] || []).map((comment) => {
        const isMine = comment.author?._id === loggedInUserId;
        const isReply = comment.parentId;
        const replyingToName = isReply ? getAuthorName(comment.parentId) : null;

        return (
          <div
            key={comment._id}
            className={`comment ${isReply ? "reply-comment" : "root-comment"}`}
            style={{ marginLeft: `${level * 25}px` }}
          >
            {isReply && (
              <div className="reply-to-label">
                ↪ Replying to <strong>{replyingToName}</strong>
              </div>
            )}
            <p>
              <strong>{comment.author?.name || "User"}:</strong>{" "}
              {comment.content || comment.text}
            </p>
            <div className="comment-actions">
              <FaReply
                className="reply-btn"
                onClick={() =>
                  setReplyingTo((prev) => ({ ...prev, [postId]: comment._id }))
                }
              />
              {isMine && (
                <FaTrash
                  className="delete-comment"
                  onClick={() => handleDeleteComment(comment._id, postId)}
                />
              )}
            </div>
            {replyingTo[postId] === comment._id && (
              <div className="reply-input">
                <input
                  type="text"
                  placeholder="Write reply..."
                  value={replyInputs[comment._id] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [comment._id]: e.target.value,
                    }))
                  }
                />
                <button onClick={() => handleReply(postId, comment._id)}>Reply</button>
              </div>
            )}
            <div className="comment-replies">
              {renderReplies(comment._id, level + 1)}
            </div>
          </div>
        );
      });

    return renderReplies("root");
  };

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (blogs.length > 0) fetchLikes();
  }, [blogs, fetchLikes]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  if (loading) return <div>🔄 Loading user profile...</div>;
  if (!user) return <div>🚫 User not found</div>;

  return (
    <>
      <Navbar />
      <div className="user-profile-container">
        <div className="user-info-card">
          <img
            src={
              user.avatar
                ? `http://localhost:5000/uploads/avatars/${user.avatar}`
                : "/default-avatar.png"
            }
            alt="avatar"
            className="avatar-large"
          />
          <div className="user-details">
            <h2>🙋 {user.name}</h2>
            <p>📧 {user.email}</p>
          </div>
          <div className="user-stats">
            <div className="stat-box">📝 Blogs: {blogs.length}</div>
            <div className="stat-box">🤝 Subscribers: {user.totalSubscribers}</div>
            {loggedInUserId !== id && (
              <div className="subscribe-box">
                <button
                  onClick={handleSubscribe}
                  className={`subscribe-btn ${isSubscribed ? "subscribed" : ""}`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="user-blogs-section">
          <h3>📚 Blogs by {user.name}</h3>
          {blogs.length === 0 ? (
            <p>No blogs yet.</p>
          ) : (
            blogs.map((blog) => (
              <div key={blog._id} className="blog-preview">
                <h4>{blog.title}</h4>
                {renderImage(blog.image) && (
                  <img
                    src={renderImage(blog.image)}
                    alt={blog.title}
                    className="blog-image"
                  />
                )}
                <p>{blog.content?.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 120)}...</p>
                <div className="blog-actions">
                  <button onClick={() => handleLike(blog._id)} className="icon-btn">
                    {likedPosts.includes(blog._id) ? <FaHeart color="red" /> : <FaRegHeart />}
                  </button>
                  <span className="like-count">({likes[blog._id] || 0})</span>
                  <button className="icon-btn" onClick={() => toggleComments(blog._id)}>
                    <FaCommentDots />
                  </button>
                  <button className="icon-btn" onClick={() => handleShare(blog._id)}>
                    <FaShareSquare />
                  </button>
                </div>

                {showComments[blog._id] && (
                  <div className="comments-section">
                    {renderComments(blog._id)}
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
                      <button onClick={() => handlePostComment(blog._id)}>Post</button>
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

export default UserPublicProfile;
