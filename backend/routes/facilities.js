const express = require('express');
const db = require('../db');
const requireLogin = require('../middleware/requireLogin');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM facilities ORDER BY facility_id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM facilities WHERE facility_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireLogin, checkRole(['admin']), async (req, res) => {
  const { name, sport, location, capacity, status } = req.body || {};
  if (!name || !sport || !location || !capacity) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }
  if (Number(capacity) <= 0) {
    return res.status(400).json({ message: 'Capacity must be more than 0' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO facilities (name, sport, location, capacity, status) VALUES (?, ?, ?, ?, ?)',
      [name, sport, location, capacity, status || 'available']
    );
    res.status(201).json({ message: 'Facility added', facility_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
  const { name, sport, location, capacity, status } = req.body || {};
  if (!name || !sport || !location || !capacity || !status) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }
  if (Number(capacity) <= 0) {
    return res.status(400).json({ message: 'Capacity must be more than 0' });
  }
  try {
    const [result] = await db.query(
      'UPDATE facilities SET name = ?, sport = ?, location = ?, capacity = ?, status = ? WHERE facility_id = ?',
      [name, sport, location, capacity, status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.json({ message: 'Facility updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM facilities WHERE facility_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    res.json({ message: 'Facility deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ message: 'Facility is in use and cannot be deleted' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
