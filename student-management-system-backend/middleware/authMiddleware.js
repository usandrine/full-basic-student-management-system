// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user (without password) to the request object
      // We explicitly select the password here as it was set to select: false in the model,
      // but we only need it for the comparison method, not to return it.
      // We retrieve the user without the password for the request object.
      req.user = await User.findById(decoded.id).select('-password'); // Exclude password from req.user

      next(); // Move to the next middleware or controller
    } catch (error) {
      console.error(error);
      res.status(401); // Unauthorized
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401); // Unauthorized
    throw new Error('Not authorized, no token');
  }
});

// New Middleware for Role-Based Access Control
const authorizeRoles = (...roles) => { // ...roles means it accepts multiple arguments as an array
  return (req, res, next) => {
    // Check if req.user exists and has a role
    if (!req.user || !req.user.role) {
      res.status(403); // Forbidden
      throw new Error('Not authorized to access this route: User role not found');
    }

    // Check if the user's role is included in the allowed roles array
    if (!roles.includes(req.user.role)) {
      res.status(403); // Forbidden
      throw new Error(`Not authorized to access this route: Role (${req.user.role}) is not allowed`);
    }
    next(); // User has the required role, proceed
  };
};

module.exports = {
  protect,
  authorizeRoles, // Export the new middleware
};