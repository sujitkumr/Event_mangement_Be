const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res, next) => {
    const { email } = req.body;
    try {
        const userExist = await User.findOne({ email });
        if (userExist) {
            return next(new ErrorResponse("Email already registered", 400));
        }
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return next(new ErrorResponse("Please provide email and password", 400));
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return next(new ErrorResponse("Invalid credentials", 400));
      }
  
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return next(new ErrorResponse("Invalid credentials", 400));
      }
  
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.status(200).json({
        success: true,
        token,
      });
    } catch (error) {
      next(error);
    }
  };


exports.guestLogin = async (req, res, next) => {
    try {
        const guestUser = {
            id: "guest",
            username: "Guest User",
            role: "guest",
        };

        const token = jwt.sign(guestUser, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({
            success: true,
            token,
            user: guestUser
        });
    } catch (error) {
        next(new ErrorResponse("Failed to log in as guest", 500));
    }
};

exports.logout = (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};
  
exports.checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // Use req.user._id here
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User:", user);
    res.status(200).json({ ...user.toObject(), message: "Authenticated" });
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};