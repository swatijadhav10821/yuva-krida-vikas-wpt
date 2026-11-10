   const express = require('express');
   const jwt = require('jsonwebtoken');
   const config = require('../config');
   const router = express.Router();
   const db = require('../db');
   const requireLogin = require('../middleware/requireLogin');
   const checkRole = require('../middleware/checkRole');

   router.post('/', async (req, res) => {
     let { name, email, message } = req.body || {};
     let userId = null;

     const header = req.headers.authorization;
     if (header) {
       try {
         userId = jwt.verify(header.split(' ')[1], config.jwtSecret).user_id;
       } catch (err) {
         userId = null;
       }
     }

     if (userId) {
       try {
         const [users] = await db.query('SELECT name, email FROM users WHERE user_id = ?', [userId]);
         if (users.length > 0) {
           name = users[0].name;
           email = users[0].email;
         }
       } catch (err) {
         return res.status(500).json({ message: 'Server error' });
       }
     }

     if (!name || !email || !message) {
       return res.status(400).json({ message: 'Please fill all fields' });
     }

     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
       return res.status(400).json({ message: 'Enter a valid email' });
     }

     if (message.length > 500) {
       return res.status(400).json({ message: 'Message must be within 500 characters' });
     }

     try {
       await db.query('INSERT INTO messages (user_id, name, email, message) VALUES (?, ?, ?, ?)', [userId, name, email, message]);
       res.status(201).json({ message: 'Message sent' });
     } catch (err) {
       res.status(500).json({ message: 'Server error' });
     }
   });

   router.get('/mine', requireLogin, async (req, res) => {
     try {
       const [rows] = await db.query(
         'SELECT message_id, message, reply, status, created_at FROM messages WHERE user_id = ? ORDER BY created_at DESC, message_id DESC',
         [req.user.user_id]
       );
       res.json(rows);
     } catch (err) {
       res.status(500).json({ message: 'Server error' });
     }
   });

      router.get('/', requireLogin, checkRole(['admin']), async (req, res) => {
     try {
       const [rows] = await db.query('SELECT * FROM messages ORDER BY created_at DESC, message_id DESC');
       res.json(rows);
     } catch (err) {
       res.status(500).json({ message: 'Server error' });
     }
   });

      router.put('/:id/reply', requireLogin, checkRole(['admin']), async (req, res) => {
     const { reply } = req.body || {};

     if (!reply) {
       return res.status(400).json({ message: 'Reply is required' });
     }

     if (reply.length > 500) {
       return res.status(400).json({ message: 'Reply must be within 500 characters' });
     }

     try {
       const [result] = await db.query(
         "UPDATE messages SET reply = ?, status = 'replied' WHERE message_id = ?",
         [reply, req.params.id]
       );

       if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Message not found' });
       }

       res.json({ message: 'Reply saved' });
     } catch (err) {
       res.status(500).json({ message: 'Server error' });
     }
   });

      router.delete('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
     try {
       const [result] = await db.query('DELETE FROM messages WHERE message_id = ?', [req.params.id]);

       if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Message not found' });
       }

       res.json({ message: 'Message deleted' });
     } catch (err) {
       res.status(500).json({ message: 'Server error' });
     }
   });

   module.exports = router;