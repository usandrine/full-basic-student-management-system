// backend/controllers/userController.js
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure multer to use memory storage for handling file uploads.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Upload user profile image to Cloudinary
// @route   PUT /api/users/upload-profile-image
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
  // We use multer as middleware to handle the 'profileImage' field.
  // The asyncHandler wrapper is important to catch errors within the async block.
  upload.single('profileImage')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'File upload failed.' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    try {
      // The file buffer is converted to a Base64 string for Cloudinary.
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      // Upload the image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "profile_pictures", // Optional: Organizes files in a folder
      });
      
      const imageUrl = cloudinaryResponse.secure_url;
      
      // Find the user and update their profile picture URL in the database
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      
      user.profilePicture = imageUrl;
      const updatedUser = await user.save();
      
      // Return the full updated user object
      res.status(200).json({ user: updatedUser });
      
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({
        message: 'Error uploading image to Cloudinary.',
        error: error.message
      });
    }
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
};
