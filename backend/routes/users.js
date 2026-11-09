   const express = require('express');
   const router = express.Router();
   const db = require('../db');
   const bcrypt = require('bcrypt');
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

      router.get('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
     try {
       const [rows] = await db.query('SELECT user_id, name, email, phone, gender, dob, district, sport, role, status, created_at FROM users WHERE user_id = ?', [req.params.id]);

       if (rows.length === 0) {
         return res.status(404).json({ message: 'User not found' });
       }

       res.json(rows[0]);
     } catch (err) {
       res.status(500).json({ message: 'Server error' });
     }
   });

      router.put('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
     const { name, phone, district, sport, role, status } = req.body || {};

     if (!name || !phone || !district || !role || !status) {
       return res.status(400).json({ message: 'Please fill all required fields' });
     }

     if (!/^[0-9]{10}$/.test(phone)) {
       return res.status(400).json({ message: 'Phone must be 10 digits' });
     }

     if (!['athlete', 'coach', 'admin'].includes(role) || !['active', 'blocked'].includes(status)) {
       return res.status(400).json({ message: 'Invalid role or status' });
     }

     try {
       const [result] = await db.query(
         'UPDATE users SET name = ?, phone = ?, district = ?, sport = ?, role = ?, status = ? WHERE user_id = ?',
         [name, phone, district, sport || null, role, status, req.params.id]
       );

       if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'User not found' });
       }

       res.json({ message: 'User updated' });
     } catch (err) {
       res.status(500).json({ message: 'Server error' });
     }
   });

      router.delete('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
     if (Number(req.params.id) === req.user.user_id) {
       return res.status(400).json({ message: 'You cannot delete your own account' });
     }

     try {
       const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);

       if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'User not found' });
       }

       res.json({ message: 'User deleted' });
     } catch (err) {
       if (err.code === 'ER_ROW_IS_REFERENCED_2') {
         return res.status(409).json({ message: 'User has bookings or other records and cannot be deleted' });
       }
       res.status(500).json({ message: 'Server error' });
     }
   });

      router.post('/', requireLogin, checkRole(['admin']), async (req, res) => {
     const { name, email, password, phone, gender, dob, address, district, emergency_phone, sport, role } = req.body || {};

     if (!name || !email || !password || !phone || !gender || !dob || !district || !role) {
       return res.status(400).json({ message: 'Please fill all required fields' });
     }

     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
       return res.status(400).json({ message: 'Enter a valid email' });
     }

     if (!/^[0-9]{10}$/.test(phone)) {
       return res.status(400).json({ message: 'Phone must be 10 digits' });
     }

     if (password.length < 6) {
       return res.status(400).json({ message: 'Password must be at least 6 characters' });
     }

     if (!['athlete', 'coach', 'admin'].includes(role)) {
       return res.status(400).json({ message: 'Invalid role' });
     }

     try {
       const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);

       if (existing.length > 0) {
         return res.status(409).json({ message: 'Email is already registered' });
       }

       const hashed = await bcrypt.hash(password, 10);

       await db.query(
         'INSERT INTO users (name, email, password, phone, gender, dob, address, district, emergency_phone, sport, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
         [name, email, hashed, phone, gender, dob, address || null, district, emergency_phone || null, sport || null, role]
       );

       res.status(201).json({ message: 'User created' });
     } catch (err) {
       res.status(500).json({ message: 'Server error' });
     }
   });


   module.exports = router;