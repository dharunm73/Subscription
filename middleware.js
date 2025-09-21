// middleware.js
const jwt = require('jsonwebtoken');
const db = require('./db');

const authenticateToken = async (req, res, next) => {
  // Get the token from the request header
  const token = req.header('x-auth-token');

  // Check if there's no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied.' }); // 401 Unauthorized
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add the user payload to the request object
    req.user = decoded.user;
    
    // Now, let's also fetch the user's subscription status and attach it
    const subscription = await db.query(
      `SELECT P.planName, S.status
       FROM Subscriptions S
       JOIN Plans P ON S.planId = P.planId
       WHERE S.userId = $1`,
       [req.user.id]
    );

    if (subscription.rows.length > 0) {
      req.subscription = subscription.rows[0]; // e.g., { planname: 'PRO', status: 'active' }
    }
    
    next(); // Move on to the next piece of middleware or the route handler
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid.' });
  }
};

module.exports = { authenticateToken };
