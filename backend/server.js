
require('dotenv').config({ path: './backend/.env' }); // Load backend-specific .env
const express = require('express');
const cors = require('cors');
const courseRoutes = require('./routes/courses');
// Import other routes as you create them
// const instructorRoutes = require('./routes/instructors');
// ... and so on

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes (configure specific origins in production)
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/courses', courseRoutes);
// app.use('/api/instructors', instructorRoutes);
// ... and so on for other entities

app.get('/', (req, res) => {
  res.send('Sci-Ed Schedule Backend is running!');
});

// Global error handler (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(\`Backend server is running on http://localhost:\${PORT}\`);
});
