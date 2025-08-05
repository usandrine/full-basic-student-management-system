// backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword); //  Reset password route

module.exports = router;
