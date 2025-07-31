// backend/routes/studentRoutes.js
const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController'); // Import the new student controllers
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Import middleware

const router = express.Router();

// Routes for getting all students and creating a new student
// Both require 'admin' role
router.route('/')
  .get(protect, authorizeRoles('admin'), getStudents)    // Get all students
  .post(protect, authorizeRoles('admin'), createStudent); // Create new student

// Routes for specific student by ID
// All require 'admin' role
router.route('/:id')
  .get(protect, authorizeRoles('admin'), getStudentById)   // Get single student
  .put(protect, authorizeRoles('admin'), updateStudent)    // Update student
  .delete(protect, authorizeRoles('admin'), deleteStudent); // Delete student

module.exports = router;