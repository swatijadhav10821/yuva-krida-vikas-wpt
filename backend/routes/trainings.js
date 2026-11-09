const express = require('express');
const db = require('../db');
const requireLogin = require('../middleware/requireLogin');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

const listQuery =
  'SELECT t.*, u.name AS coach_name, f.name AS facility_name, ' +
  '(t.seats - (SELECT COUNT(*) FROM enrollments e WHERE e.training_id = t.training_id)) AS seats_left ' +
  'FROM trainings t JOIN users u ON t.coach_id = u.user_id JOIN facilities f ON t.facility_id = f.facility_id ';

function today() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + month + '-' + day;
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(listQuery + 'ORDER BY t.training_date, t.start_time');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/mine', requireLogin, checkRole(['coach']), async (req, res) => {
  try {
    const [rows] = await db.query(listQuery + 'WHERE t.coach_id = ? ORDER BY t.training_date, t.start_time', [req.user.user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(listQuery + 'WHERE t.training_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireLogin, checkRole(['coach']), async (req, res) => {
  const { facility_id, title, training_date, start_time, end_time, seats } = req.body || {};
  if (!facility_id || !title || !training_date || !start_time || !end_time || !seats) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }
  if (training_date < today()) {
    return res.status(400).json({ message: 'Training date cannot be in the past' });
  }
  if (end_time <= start_time) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }
  if (Number(seats) <= 0) {
    return res.status(400).json({ message: 'Seats must be more than 0' });
  }
  try {
    const [facility] = await db.query('SELECT facility_id FROM facilities WHERE facility_id = ?', [facility_id]);
    if (facility.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    const [result] = await db.query(
      'INSERT INTO trainings (coach_id, facility_id, title, training_date, start_time, end_time, seats) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.user_id, facility_id, title, training_date, start_time, end_time, seats]
    );
    res.status(201).json({ message: 'Training added', training_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireLogin, checkRole(['coach']), async (req, res) => {
  const { facility_id, title, training_date, start_time, end_time, seats } = req.body || {};
  if (!facility_id || !title || !training_date || !start_time || !end_time || !seats) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }
  if (end_time <= start_time) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }
  if (Number(seats) <= 0) {
    return res.status(400).json({ message: 'Seats must be more than 0' });
  }
  try {
    const [enrolled] = await db.query('SELECT COUNT(*) AS total FROM enrollments WHERE training_id = ?', [req.params.id]);
    if (Number(seats) < enrolled[0].total) {
      return res.status(400).json({ message: 'Seats cannot be less than the athletes already enrolled' });
    }
    const [result] = await db.query(
      'UPDATE trainings SET facility_id = ?, title = ?, training_date = ?, start_time = ?, end_time = ?, seats = ? WHERE training_id = ? AND coach_id = ?',
      [facility_id, title, training_date, start_time, end_time, seats, req.params.id, req.user.user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    res.json({ message: 'Training updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireLogin, checkRole(['coach', 'admin']), async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      [result] = await db.query('DELETE FROM trainings WHERE training_id = ?', [req.params.id]);
    } else {
      [result] = await db.query('DELETE FROM trainings WHERE training_id = ? AND coach_id = ?', [req.params.id, req.user.user_id]);
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    res.json({ message: 'Training deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
