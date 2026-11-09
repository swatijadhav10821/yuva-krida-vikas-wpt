const express = require('express');
const db = require('../db');
const requireLogin = require('../middleware/requireLogin');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

router.get('/my', requireLogin, checkRole(['athlete']), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT e.*, t.title, t.training_date, t.start_time, t.end_time, f.name AS facility_name FROM enrollments e JOIN trainings t ON e.training_id = t.training_id JOIN facilities f ON t.facility_id = f.facility_id WHERE e.user_id = ? ORDER BY t.training_date DESC',
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/training/:trainingId', requireLogin, checkRole(['coach', 'admin']), async (req, res) => {
  try {
    const [training] = await db.query('SELECT * FROM trainings WHERE training_id = ?', [req.params.trainingId]);
    if (training.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    if (req.user.role === 'coach' && training[0].coach_id !== req.user.user_id) {
      return res.status(403).json({ message: 'This is not your training' });
    }
    const [rows] = await db.query(
      'SELECT e.*, u.name, u.phone FROM enrollments e JOIN users u ON e.user_id = u.user_id WHERE e.training_id = ? ORDER BY u.name',
      [req.params.trainingId]
    );
    res.json({ training: training[0], enrollments: rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireLogin, checkRole(['athlete']), async (req, res) => {
  const { training_id } = req.body || {};
  if (!training_id) {
    return res.status(400).json({ message: 'Training is required' });
  }
  try {
    const [training] = await db.query(
      'SELECT t.seats, (SELECT COUNT(*) FROM enrollments e WHERE e.training_id = t.training_id) AS taken FROM trainings t WHERE t.training_id = ?',
      [training_id]
    );
    if (training.length === 0) {
      return res.status(404).json({ message: 'Training not found' });
    }
    if (training[0].taken >= training[0].seats) {
      return res.status(400).json({ message: 'No seats left' });
    }
    await db.query('INSERT INTO enrollments (training_id, user_id) VALUES (?, ?)', [training_id, req.user.user_id]);
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'You are already enrolled in this training' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/attendance', requireLogin, checkRole(['coach', 'admin']), async (req, res) => {
  const { attendance, remark } = req.body || {};
  if (attendance !== 'pending' && attendance !== 'present' && attendance !== 'absent') {
    return res.status(400).json({ message: 'Attendance must be pending, present or absent' });
  }
  if (remark && remark.length > 200) {
    return res.status(400).json({ message: 'Remark must be within 200 characters' });
  }
  try {
    const [rows] = await db.query(
      'SELECT t.coach_id FROM enrollments e JOIN trainings t ON e.training_id = t.training_id WHERE e.enrollment_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    if (req.user.role === 'coach' && rows[0].coach_id !== req.user.user_id) {
      return res.status(403).json({ message: 'This is not your training' });
    }
    await db.query('UPDATE enrollments SET attendance = ?, remark = ? WHERE enrollment_id = ?', [attendance, remark || null, req.params.id]);
    res.json({ message: 'Attendance saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireLogin, checkRole(['athlete', 'admin']), async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      [result] = await db.query('DELETE FROM enrollments WHERE enrollment_id = ?', [req.params.id]);
    } else {
      [result] = await db.query('DELETE FROM enrollments WHERE enrollment_id = ? AND user_id = ?', [req.params.id, req.user.user_id]);
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    res.json({ message: 'Enrollment removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
