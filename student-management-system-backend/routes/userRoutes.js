// backend/routes/userRoutes.js
const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();

// Both routes require authentication
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;