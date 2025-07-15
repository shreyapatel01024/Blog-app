// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Connect to MongoDB
connectDB();

// ✅ Serve uploaded avatars from backend
app.use("/uploads/avatars", express.static("uploads/avatars"));

// ✅ API Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/likes", require("./routes/likeRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/admin", require("./routes/adminRoutes")); // ✅ For admin actions
// In server.js or app.js
const commentRoutes = require("./routes/commentRouter");
app.use("/api/comments", commentRoutes);



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
