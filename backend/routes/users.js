   const express = require('express');
   const router = express.Router();
   const db = require('../db');
   const requireLogin = require('../middleware/requireLogin');
   const checkRole = require('../middleware/checkRole');

   router.get('/', requireLogin, checkRole(['admin']), async (req, res) => {
     try {
       const [rows] = await db.query('SELECT user_id, name, email, phone, gender, dob, district, sport, role, status, created_at FROM users');
       res.json(rows);
     } catch (err) {
       res.status(500).json({ message: 'Server error' });
     }
   });

   module.exports = router;