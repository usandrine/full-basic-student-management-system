// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password in queries by default
    },
    phoneNumber: {
      type: String,
      required: false, // Optional
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    profilePicture: {
      type: String,
      default: 'no-photo.jpg', // Placeholder for now, can be changed for actual uploads
    },
    // Fields specific to students
    courseOfStudy: {
      type: String,
      required: function() { return this.role === 'student'; }, // Required only if role is student
      default: null, // Default to null if not a student
    },
    enrollmentYear: {
      type: Number,
      required: function() { return this.role === 'student'; },
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Graduated', 'Dropped'],
      default: 'Active',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);