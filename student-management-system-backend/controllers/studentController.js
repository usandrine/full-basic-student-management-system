// backend/controllers/studentController.js
const User = require('../models/User'); // We use the User model as it contains student data
const asyncHandler = require('express-async-handler');

// @desc    Get all students (Admin only)
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
  // Find all users with the role 'student'
  const students = await User.find({ role: 'student' }).select('-password'); // Exclude passwords

  if (students) {
    res.status(200).json(students);
  } else {
    res.status(404);
    throw new Error('No student records found');
  }
});

// @desc    Get single student by ID (Admin only)
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudentById = asyncHandler(async (req, res) => {
  // Find a user by ID and ensure their role is 'student'
  const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password');

  if (student) {
    res.status(200).json(student);
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

// @desc    Create a new student record (Admin only)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
  const { fullName, email, password, phoneNumber, courseOfStudy, enrollmentYear, status } = req.body;

  // Basic validation for student creation
  if (!fullName || !email || !password || !courseOfStudy || !enrollmentYear) {
    res.status(400);
    throw new Error('Please enter all required student fields: Full Name, Email, Password, Course of Study, Enrollment Year');
  }

  // Check if a user with this email already exists (regardless of role)
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Create the new student. Role is explicitly 'student' here.
  const student = await User.create({
    fullName,
    email,
    password, // Password will be hashed by pre-save hook
    phoneNumber: phoneNumber || null, // Allow null if not provided
    role: 'student', // Force role to student
    courseOfStudy,
    enrollmentYear,
    status: status || 'Active', // Default status
  });

  if (student) {
    res.status(201).json({
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      role: student.role,
      profilePicture: student.profilePicture,
      courseOfStudy: student.courseOfStudy,
      enrollmentYear: student.enrollmentYear,
      status: student.status,
    });
  } else {
    res.status(400);
    throw new Error('Invalid student data provided');
  }
});

// @desc    Update a student record by ID (Admin only)
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
  // Find the student by ID and ensure their role is 'student'
  const student = await User.findOne({ _id: req.params.id, role: 'student' });

  if (student) {
    // Update fields if provided in request body
    student.fullName = req.body.fullName || student.fullName;
    student.email = req.body.email || student.email;
    student.phoneNumber = req.body.phoneNumber || student.phoneNumber;
    student.courseOfStudy = req.body.courseOfStudy || student.courseOfStudy;
    student.enrollmentYear = req.body.enrollmentYear || student.enrollmentYear;
    student.status = req.body.status || student.status; // Admin can change status

    // Password update: only if new password is provided
    if (req.body.password) {
      student.password = req.body.password; // Mongoose pre-save hook will hash this
    }

    const updatedStudent = await student.save();

    res.json({
      _id: updatedStudent._id,
      fullName: updatedStudent.fullName,
      email: updatedStudent.email,
      phoneNumber: updatedStudent.phoneNumber,
      role: updatedStudent.role,
      profilePicture: updatedStudent.profilePicture,
      courseOfStudy: updatedStudent.courseOfStudy,
      enrollmentYear: updatedStudent.enrollmentYear,
      status: updatedStudent.status,
    });
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

// @desc    Delete a student record by ID (Admin only)
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  // Find the student by ID and ensure their role is 'student'
  const student = await User.findOne({ _id: req.params.id, role: 'student' });

  if (student) {
    await student.deleteOne(); // Use deleteOne() for Mongoose 6+
    res.status(200).json({ message: 'Student removed' });
  } else {
    res.status(404);
    throw new Error('Student not found');
  }
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};