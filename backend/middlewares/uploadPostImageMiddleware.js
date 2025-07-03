// backend/middlewares/uploadPostImageMiddleware.js

const multer = require("multer");

// Use memory storage for storing image as Buffer in MongoDB
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Optional: limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

module.exports = upload; // Use upload.single("image") in route
