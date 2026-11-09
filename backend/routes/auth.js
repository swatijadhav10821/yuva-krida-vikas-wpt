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

router.post('/register', async (req, res) => {
    const { name, email, password, phone, gender, dob, address, district, emergency_phone, sport } = req.body || {};

    if (!name || !email || !password || !phone || !gender || !dob || !district) {
       return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;

    if (!emailPattern.test(email)) {
       return res.status(400).json({ message: 'Enter a valid email' });
    }

    if (!phonePattern.test(phone)) {
       return res.status(400).json({ message: 'Phone must be 10 digits' });
    }

    if (password.length < 6) {
       return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
       const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);

       if (existing.length > 0) {
         return res.status(409).json({ message: 'Email is already registered' });
       }

       const hashed = await bcrypt.hash(password, 10);

       await db.query(
         'INSERT INTO users (name, email, password, phone, gender, dob, address, district, emergency_phone, sport, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
         [name, email, hashed, phone, gender, dob, address || null, district, emergency_phone || null, sport || null, 'athlete']
       );

       res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
       res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;