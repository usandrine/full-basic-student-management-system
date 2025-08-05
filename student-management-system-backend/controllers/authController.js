// backend/controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // NEW: Import the email utility

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
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
        courseOfStudy,
        enrollmentYear,
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

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
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

// @desc    Log out user (typically handled client-side by removing token)
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    // For JWT, logout is primarily a client-side action of discarding the token.
    // We can send a success message here to acknowledge the request.
    res.json({ message: 'User logged out successfully (token discarded client-side)' });
});


// @desc    Request a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });

    // 2. If user exists, generate a reset token and save it
    if (user) {
        // Generate a random, secure token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash the token before saving it to the database for security
        user.passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
            
        // Set a token expiration time (e.g., 1 hour)
        user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        
        await user.save();

        // 3. Create a password reset URL for the user
        const resetURL = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
        
        // 4. Send the email using the new utility
        const message = `
            <p>You are receiving this email because you (or someone else) have requested the reset of a password for your EduManage account.</p>
            <p>Please click on the link below to reset your password:</p>
            <a href="${resetURL}" style="display:inline-block; padding:10px 20px; background-color:#4f46e5; color:#ffffff; text-decoration:none; border-radius:5px; margin-top:15px;">Reset Password</a>
            <p>This link is only valid for 1 hour. If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <p>Thank you,</p>
            <p>The EduManage Team</p>
        `;
        
        try {
            await sendEmail({
                email: user.email,
                subject: 'EduManage Password Reset Request',
                message,
            });
            // For security, always send a generic success message.
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            res.status(500);
            throw new Error('There was an error sending the password reset email. Please try again later.');
        }

    } else {
        // If no user is found, send a generic success message for security reasons
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
});


// @desc    Reset user password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    // 1. Get the token from the request body and hash it
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find the user with the correct hashed token and a non-expired date
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // $gt is MongoDB for 'greater than'
    });

    // 3. If no user is found, the token is invalid or has expired
    if (!user) {
        res.status(400);
        throw new Error('Password reset token is invalid or has expired.');
    }

    // 4. Update the user's password and clear the reset fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // The pre-save hook in your User model will hash the new password.

    // 5. Send a success response
    res.status(200).json({ message: 'Your password has been updated successfully.' });
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword, // NEW: Export the new function
};
