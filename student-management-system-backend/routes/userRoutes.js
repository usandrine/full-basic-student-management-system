// backend/routes/userRoutes.js
const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfileImage // Import the new controller function
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();

// Both routes require authentication
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

// New route for uploading a profile image
// This route also requires authentication with the 'protect' middleware
router.put('/upload-profile-image', protect, uploadProfileImage);

module.exports = router;
