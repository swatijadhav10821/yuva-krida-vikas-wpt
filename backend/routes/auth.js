const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');

router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account is blocked' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    res.json({
      token: token,
      user: { user_id: user.user_id, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', requireLogin, async (req, res) => {
    const [rows] = await db.query('SELECT user_id, name, email, role FROM users WHERE user_id = ?', [req.user.user_id]);
    res.json(rows[0]);
});
module.exports = router;