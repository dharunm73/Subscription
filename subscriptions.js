// subscriptions.js
const express = require('express');
const router = express.Router();
const db = require('./db');
const { authenticateToken } = require('./middleware');

// @route   POST /subscriptions/subscribe
// @desc    Subscribe the current user to the PRO plan
// @access  Private
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the planId for the 'PRO' plan
    const proPlan = await db.query("SELECT planId FROM Plans WHERE planName = 'PRO'");
    if (proPlan.rows.length === 0) {
      return res.status(500).json({ error: 'PRO plan not found.' });
    }
    const proPlanId = proPlan.rows[0].planid;

    // Set an end date 30 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    // Update the user's subscription to PRO
    await db.query(
      `UPDATE Subscriptions 
       SET planId = $1, status = 'active', endDate = $2 
       WHERE userId = $3`,
      [proPlanId, endDate, userId]
    );
    
    res.json({ msg: 'Successfully subscribed to PRO plan.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
