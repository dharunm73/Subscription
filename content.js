// content.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./middleware');

// @route   GET /content/free
// @desc    Get free content, accessible to everyone
// @access  Public
router.get('/free', (req, res) => {
  res.json({ msg: 'This is free content. Anyone can see this!' });
});

// @route   GET /content/pro
// @desc    Get pro content, accessible only to active PRO subscribers
// @access  Private
router.get('/pro', authenticateToken, (req, res) => {
    // The authenticateToken middleware already ran and attached the subscription info to req
    if (req.subscription && req.subscription.planname === 'PRO' && req.subscription.status === 'active') {
        res.json({ msg: 'Welcome, PRO member! Here is your exclusive content.' });
    } else {
        // This is a 403 Forbidden error: we know who you are, but you don't have permission
        res.status(403).json({ msg: 'Access denied. PRO subscription required.' });
    }
});

module.exports = router;
