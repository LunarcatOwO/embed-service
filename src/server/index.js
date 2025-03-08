require('dotenv').config();
const express = require('express');
const path = require('path');
const setupRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());

// Set up routes
setupRoutes(app);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});