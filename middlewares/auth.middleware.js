const jwt =require('jsonwebtoken');
const User = require('../models/user.model');



exports.protectRoute = async (req, res, next) => {
  try {
    // Try to extract the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }
    console.log("JWT Secret:", process.env.JWT_SECRET);

  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debug log

    // If you signed with { id: user._id }, then use decoded.id.
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Authenticated User:", user); // Debug log

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
  