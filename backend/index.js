const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connect');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// ✅ Mount routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/owners', require('./routes/ownerRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));

// Test route
app.get('/', (req, res) => {
  res.send('✅ Backend is working');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
