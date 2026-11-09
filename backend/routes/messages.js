   const express = require('express');
   const router = express.Router();
   const db = require('../db');
   const requireLogin = require('../middleware/requireLogin');
   const checkRole = require('../middleware/checkRole');

   router.post('/', async (req, res) => {
     const { name, email, message } = req.body || {};

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
       await db.query('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
       res.status(201).json({ message: 'Message sent' });
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