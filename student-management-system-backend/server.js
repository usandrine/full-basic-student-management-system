// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes'); // Keep using this existing file

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
const cors = require('cors');

// ... other code

const corsOptions = {
  origin: 'https://full-basic-student-management-system.vercel.app',
  credentials: true, // needed for cookies/sessions
};

app.use(cors(corsOptions)); // <-- Use the new options here



// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount routes
// Ensure all your specific API routes are mounted BEFORE the error handlers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Mount the studentRoutes at the /api/admin path to match the frontend
app.use('/api/admin/students', studentRoutes); // <-- CHANGE THIS LINE

// Error handling middleware
// THESE MUST BE PLACED *AFTER* ALL YOUR app.use('/api/...') ROUTES
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});