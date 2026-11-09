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

async function isSlotTaken(facilityId, date, start, end, skipId) {
  const [rows] = await db.query(
    "SELECT booking_id FROM bookings WHERE facility_id = ? AND booking_date = ? AND status = 'approved' AND start_time < ? AND end_time > ? AND booking_id <> ?",
    [facilityId, date, end, start, skipId || 0]
  );
  return rows.length > 0;
}

router.get('/my', requireLogin, checkRole(['athlete']), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT b.*, f.name AS facility_name FROM bookings b JOIN facilities f ON b.facility_id = f.facility_id WHERE b.user_id = ? ORDER BY b.booking_date DESC, b.start_time DESC',
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', requireLogin, checkRole(['admin']), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT b.*, f.name AS facility_name, u.name AS user_name FROM bookings b JOIN facilities f ON b.facility_id = f.facility_id JOIN users u ON b.user_id = u.user_id ORDER BY b.booking_id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireLogin, checkRole(['athlete']), async (req, res) => {
  const { facility_id, booking_date, start_time, end_time, purpose } = req.body || {};
  if (!facility_id || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }
  if (booking_date < today()) {
    return res.status(400).json({ message: 'Booking date cannot be in the past' });
  }
  if (end_time <= start_time) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }
  try {
    const [facility] = await db.query('SELECT status FROM facilities WHERE facility_id = ?', [facility_id]);
    if (facility.length === 0) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    if (facility[0].status !== 'available') {
      return res.status(400).json({ message: 'Facility is closed' });
    }
    if (await isSlotTaken(facility_id, booking_date, start_time, end_time)) {
      return res.status(409).json({ message: 'This time slot is already booked' });
    }
    const [result] = await db.query(
      'INSERT INTO bookings (user_id, facility_id, booking_date, start_time, end_time, purpose) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.user_id, facility_id, booking_date, start_time, end_time, purpose || null]
    );
    res.status(201).json({ message: 'Booking request sent', booking_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/status', requireLogin, checkRole(['admin']), async (req, res) => {
  const { status } = req.body || {};
  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE booking_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = rows[0];
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be changed' });
    }
    if (status === 'approved') {
      const taken = await isSlotTaken(booking.facility_id, booking.booking_date, booking.start_time, booking.end_time, booking.booking_id);
      if (taken) {
        return res.status(409).json({ message: 'Another booking is already approved for this slot' });
      }
    }
    await db.query('UPDATE bookings SET status = ? WHERE booking_id = ?', [status, req.params.id]);
    res.json({ message: 'Booking ' + status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/cancel', requireLogin, checkRole(['athlete']), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?', [req.params.id, req.user.user_id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (rows[0].status !== 'pending' && rows[0].status !== 'approved') {
      return res.status(400).json({ message: 'This booking cannot be cancelled' });
    }
    await db.query("UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?", [req.params.id]);
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireLogin, checkRole(['admin']), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM bookings WHERE booking_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
