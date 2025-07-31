// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors'); // <-- KEEP THIS LINE (the one at the top)

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
// <-- REMOVE THE DUPLICATE `const cors = require('cors');` LINE HERE

const corsOptions = {
    origin: 'https://full-basic-student-management-system.vercel.app',
    credentials: true,
};

app.use(cors(corsOptions)); // <-- This line is correct

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/students', studentRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});