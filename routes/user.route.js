const express = require("express");
const {
  registerUser,
  loginUser,
  guestLogin,
  logout,checkAuth
} = require("../controllers/user.controller");
const router = express.Router();
const   { protectRoute } = require("../middlewares/auth.middleware");

router.post("/register",registerUser );
router.post("/login", loginUser);
router.post("/guestLogin", guestLogin);
router.get("/logout",logout)
router.get("/checkauth",protectRoute,checkAuth);
module.exports = router;