import React, { useState } from "react";
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      toast.error("Title and description are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", description);
    formData.append("tags", tags);
    if (image) {
      formData.append("image", image);
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:5000/api/posts/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Blog posted successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setTags("");
      setImage(null);
      setPreviewUrl("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to post blog");
    }
  };

  return (
    <>
      <Navbar />
      <div className="add-blog-container">
        <h2>Add a New Blog</h2>
        <form onSubmit={handleSubmit} className="add-blog-form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
            placeholder="Write your blog content here..."
          />

          <input
            type="text"
            placeholder="Tags (comma separated, e.g. #tech, #coding)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <input type="file" accept="image/*" onChange={handleImageChange} />

          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}

          <button type="submit">Post Blog</button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AddBlog;
