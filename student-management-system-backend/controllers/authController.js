// backend/controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler'); // A simple middleware for handling exceptions inside of async express routes

// Install express-async-handler if you haven't: npm install express-async-handler
// This helps to avoid writing try-catch blocks everywhere for async/await

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    console.log('Received request body for student:', req.body);
  const { fullName, email, password, phoneNumber, role, courseOfStudy, enrollmentYear, status } = req.body;


  // Basic validation
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Please enter all required fields: full name, email, and password');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    password, // Password will be hashed by the pre-save hook in User model
    phoneNumber,
    role: role || 'student', // Default to student if not provided
    courseOfStudy,          // Pass courseOfStudy
    enrollmentYear,         // Pass enrollmentYear
    status: status || 'Active', // Pass status, default to 'Active' if not provided
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profilePicture: user.profilePicture,
      // Only include student-specific fields if the role is student
      ...(user.role === 'student' && {
        courseOfStudy: user.courseOfStudy,
        enrollmentYear: user.enrollmentYear,
        status: user.status,
      }),
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter email and password');
  }

  // Check for user by email (include password for comparison)
  const user = await User.findOne({ email }).select('+password'); // Explicitly select password

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profilePicture: user.profilePicture,
      // Only include student-specific fields if the role is student
      ...(user.role === 'student' && {
        courseOfStudy: user.courseOfStudy,
        enrollmentYear: user.enrollmentYear,
        status: user.status,
      }),
      token: generateToken(user._id),
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Invalid credentials');
  }
});

// @desc    Log out user (typically handled client-side by removing token)
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  // For JWT, logout is primarily a client-side action of discarding the token.
  // We can send a success message here to acknowledge the request.
  res.json({ message: 'User logged out successfully (token discarded client-side)' });
});


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};