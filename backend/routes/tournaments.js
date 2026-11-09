const express = require('express');
const db = require('../db');
const requireLogin = require('../middleware/requireLogin');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

const listQuery =
  'SELECT t.*, f.name AS facility_name, f.sport, f.location, ' +
  '(SELECT COUNT(*) FROM registrations r WHERE r.tournament_id = t.tournament_id AND r.status = \'registered\') AS registered_count ' +
  'FROM tournaments t JOIN facilities f ON t.facility_id = f.facility_id ';

function checkDates(body) {
  const { title, facility_id, start_date, end_date, last_date } = body;
  if (!title || !facility_id || !start_date || !end_date || !last_date) {
    return 'Please fill all required fields';
  }
  if (end_date < start_date) {
    return 'End date cannot be before start date';
  }
  if (last_date > start_date) {
    return 'Last date to register must be on or before the start date';
  }
  return '';
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(listQuery + 'ORDER BY t.start_date');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(listQuery + 'WHERE t.tournament_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireLogin, checkRole(['admin']), async (req, res) => {
  const body = req.body || {};
  const problem = checkDates(body);
  if (problem) {
    return res.status(400).json({ message: problem });
  }
  try {
    const [facility] = await db.query('SELECT facility_id FROM facilities WHERE facility_id = ?', [body.facility_id]);
    if (facility.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    const [result] = await db.query(
      'INSERT INTO tournaments (title, facility_id, start_date, end_date, last_date, description, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [body.title, body.facility_id, body.start_date, body.end_date, body.last_date, body.description || null, body.status || 'upcoming', req.user.user_id]
    );
    res.status(201).json({ message: 'Tournament added', tournament_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
  const body = req.body || {};
  const problem = checkDates(body);
  if (problem) {
    return res.status(400).json({ message: problem });
  }
  if (!body.status) {
    return res.status(400).json({ message: 'Status is required' });
  }
  try {
    const [result] = await db.query(
      'UPDATE tournaments SET title = ?, facility_id = ?, start_date = ?, end_date = ?, last_date = ?, description = ?, status = ? WHERE tournament_id = ?',
      [body.title, body.facility_id, body.start_date, body.end_date, body.last_date, body.description || null, body.status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json({ message: 'Tournament updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tournaments WHERE tournament_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    res.json({ message: 'Tournament deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
