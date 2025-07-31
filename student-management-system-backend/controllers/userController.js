// backend/controllers/userController.js
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
// No need for generateToken here as we're not logging in/registering again

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware
  const user = await User.findById(req.user._id).select('-password'); // Ensure password is not sent

  if (user) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profilePicture: user.profilePicture,
      ...(user.role === 'student' && {
        courseOfStudy: user.courseOfStudy,
        enrollmentYear: user.enrollmentYear,
        status: user.status,
      }),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    // profilePicture will be handled later if we implement file uploads
    // user.profilePicture = req.body.profilePicture || user.profilePicture;

    // Students can update their specific fields
    if (user.role === 'student') {
      user.courseOfStudy = req.body.courseOfStudy || user.courseOfStudy;
      user.enrollmentYear = req.body.enrollmentYear || user.enrollmentYear;
      user.status = req.body.status || user.status;
    }

    // Password update: only if new password is provided
    if (req.body.password) {
      user.password = req.body.password; // Mongoose pre-save hook will hash this
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      ...(updatedUser.role === 'student' && {
        courseOfStudy: updatedUser.courseOfStudy,
        enrollmentYear: updatedUser.enrollmentYear,
        status: updatedUser.status,
      }),
      // We don't generate a new token on profile update unless password changes,
      // but for simplicity, we can include it or rely on the existing one.
      // If password changes, it's good practice to issue a new token.
      // For now, we'll keep it simple and just return the updated user data.
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getUserProfile,
  updateUserProfile,
};