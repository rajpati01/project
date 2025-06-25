const User = require("../models/User");
const { validationResult } = require("express-validator");
const { sendTokenResponse } = require("../utils/helpers");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  console.log("Incoming req.body:", req.body);

  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation failed:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, password, confirmPassword, role } =
      req.body;

    // check if user already exist
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password do not match" });
    }

    //create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    // Send token response
    sendTokenResponse(user, 201, res, "User registered successfully");
  } catch (err) {
    // console.log('Received body:', req.body);
    console.error("Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
