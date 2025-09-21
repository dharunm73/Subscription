// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const router = express.Router();

// === REGISTRATION ENDPOINT ===
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user already exists
    const userExists = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert the new user into the database
    const newUser = await db.query(
      'INSERT INTO Users (email, passwordHash) VALUES ($1, $2) RETURNING userId, email',
      [email, passwordHash]
    );

    // 4. Give the user a FREE plan by default
    const freePlan = await db.query("SELECT planId FROM Plans WHERE planName = 'FREE'");
    await db.query(
        'INSERT INTO Subscriptions (userId, planId, status) VALUES ($1, $2, $3)',
        [newUser.rows[0].userid, freePlan.rows[0].planid, 'active']
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// === LOGIN ENDPOINT ===
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 2. Check if password is correct
        const isValidPassword = await bcrypt.compare(password, user.rows[0].passwordhash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 3. Create and return a JWT
        const payload = {
            user: {
                id: user.rows[0].userid,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;
