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

// Use the route files
app.use('/auth', require('./auth'));
app.use('/subscriptions', require('./subscriptions')); // Add this line
app.use('/content', require('./content'));           // Add this line


// === START SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
