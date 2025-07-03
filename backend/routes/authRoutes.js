const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const uploadAvatar = require("../middlewares/uploadAvatarMiddleware");

router.post("/register", uploadAvatar.single("avatar"), register);
router.post("/login", login);

module.exports = router;
