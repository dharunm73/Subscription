// index.js
const express = require('express');
require('dotenv').config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// === ROUTES ===
app.get('/', (req, res) => {
  res.send('Subscription Service API is running!');
});

// Use the authentication routes
app.use('/auth', require('./auth'));


// === START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
