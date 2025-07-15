import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/AddBlog.css";

const AddBlog = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      toast.error("🔒 Please login to post a blog.");
    } else {
      setToken(storedToken);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      toast.error("❗ Title and description are required.");
      return;
    }

    if (!token) {
      toast.error("🔒 Unauthorized: No token found.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", description);
    formData.append("tags", tags);
    if (image) formData.append("image", image);

    try {
      await axios.post("http://localhost:5000/api/posts/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("✅ Blog posted!");
      setTitle("");
      setDescription("");
      setTags("");
      setImage(null);
      setPreviewUrl("");
    } catch (err) {
      console.error("❌ Blog post error:", err);
      toast.error(err.response?.data?.message || "❌ Failed to post blog");
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-blog-container">
        <h2>📝 Add a New Blog</h2>
        <form onSubmit={handleSubmit} className="add-blog-form">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
          <ReactQuill theme="snow" value={description} onChange={setDescription} />
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated)" />
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {previewUrl && <img src={previewUrl} alt="Preview" className="image-preview" />}
          <button type="submit" className="submit-btn">🚀 Post Blog</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AddBlog;
