const express = require('express');
const db = require('../db');
const requireLogin = require('../middleware/requireLogin');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM matches WHERE tournament_id = ? ORDER BY match_date, match_time',
      [req.params.tournamentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', requireLogin, checkRole(['coach', 'admin']), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT m.*, t.title AS tournament_title FROM matches m JOIN tournaments t ON m.tournament_id = t.tournament_id ORDER BY m.match_date, m.match_time'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireLogin, checkRole(['admin']), async (req, res) => {
  const { tournament_id, team_a, team_b, match_date, match_time } = req.body || {};
  if (!tournament_id || !team_a || !team_b || !match_date || !match_time) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }
  if (team_a === team_b) {
    return res.status(400).json({ message: 'Both teams cannot be the same' });
  }
  try {
    const [tournament] = await db.query('SELECT tournament_id FROM tournaments WHERE tournament_id = ?', [tournament_id]);
    if (tournament.length === 0) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    const [result] = await db.query(
      'INSERT INTO matches (tournament_id, team_a, team_b, match_date, match_time) VALUES (?, ?, ?, ?, ?)',
      [tournament_id, team_a, team_b, match_date, match_time]
    );
    res.status(201).json({ message: 'Match added', match_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
  const { team_a, team_b, match_date, match_time } = req.body || {};
  if (!team_a || !team_b || !match_date || !match_time) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }
  if (team_a === team_b) {
    return res.status(400).json({ message: 'Both teams cannot be the same' });
  }
  try {
    const [result] = await db.query(
      'UPDATE matches SET team_a = ?, team_b = ?, match_date = ?, match_time = ? WHERE match_id = ?',
      [team_a, team_b, match_date, match_time, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json({ message: 'Match updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/score', requireLogin, checkRole(['coach', 'admin']), async (req, res) => {
  const { score_a, score_b } = req.body || {};
  if (score_a === undefined || score_b === undefined || score_a === '' || score_b === '') {
    return res.status(400).json({ message: 'Enter the score of both teams' });
  }
  if (Number(score_a) < 0 || Number(score_b) < 0 || isNaN(Number(score_a)) || isNaN(Number(score_b))) {
    return res.status(400).json({ message: 'Scores must be numbers of 0 or more' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM matches WHERE match_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    const match = rows[0];
    const score = {};
    score[match.team_a] = Number(score_a);
    score[match.team_b] = Number(score_b);
    let winner = 'Draw';
    if (Number(score_a) > Number(score_b)) winner = match.team_a;
    if (Number(score_b) > Number(score_a)) winner = match.team_b;
    await db.query(
      "UPDATE matches SET score = ?, winner = ?, status = 'completed', entered_by = ? WHERE match_id = ?",
      [JSON.stringify(score), winner, req.user.user_id, req.params.id]
    );
    res.json({ message: 'Score saved', winner });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM matches WHERE match_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }
    res.json({ message: 'Match deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
