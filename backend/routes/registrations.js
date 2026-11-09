const express = require('express');
const db = require('../db');
const requireLogin = require('../middleware/requireLogin');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

function today() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + month + '-' + day;
}

router.get('/my', requireLogin, checkRole(['athlete']), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT r.*, t.title, t.start_date, t.status AS tournament_status FROM registrations r JOIN tournaments t ON r.tournament_id = t.tournament_id WHERE r.user_id = ? ORDER BY r.registration_id DESC',
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/tournament/:tournamentId', requireLogin, checkRole(['admin', 'coach']), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT r.*, u.name, u.phone, u.district FROM registrations r JOIN users u ON r.user_id = u.user_id WHERE r.tournament_id = ? ORDER BY r.registration_id',
      [req.params.tournamentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireLogin, checkRole(['athlete']), async (req, res) => {
  const { tournament_id } = req.body || {};
  if (!tournament_id) {
    return res.status(400).json({ message: 'Tournament is required' });
  }
  try {
    const [tournament] = await db.query('SELECT status, last_date FROM tournaments WHERE tournament_id = ?', [tournament_id]);
    if (tournament.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    if (tournament[0].status !== 'upcoming') {
      return res.status(400).json({ message: 'Registration is closed for this tournament' });
    }
    if (tournament[0].last_date < today()) {
      return res.status(400).json({ message: 'The last date to register has passed' });
    }
    const [existing] = await db.query('SELECT * FROM registrations WHERE tournament_id = ? AND user_id = ?', [tournament_id, req.user.user_id]);
    if (existing.length > 0) {
      if (existing[0].status === 'registered') {
        return res.status(409).json({ message: 'You are already registered for this tournament' });
      }
      await db.query("UPDATE registrations SET status = 'registered' WHERE registration_id = ?", [existing[0].registration_id]);
      return res.json({ message: 'Registered again successfully' });
    }
    await db.query('INSERT INTO registrations (tournament_id, user_id) VALUES (?, ?)', [tournament_id, req.user.user_id]);
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/withdraw', requireLogin, checkRole(['athlete']), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM registrations WHERE registration_id = ? AND user_id = ?', [req.params.id, req.user.user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    if (rows[0].status === 'withdrawn') {
      return res.status(400).json({ message: 'You have already withdrawn' });
    }
    await db.query("UPDATE registrations SET status = 'withdrawn' WHERE registration_id = ?", [req.params.id]);
    res.json({ message: 'Registration withdrawn' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM registrations WHERE registration_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json({ message: 'Registration deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
