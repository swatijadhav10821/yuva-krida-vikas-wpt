import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function BookFacility() {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ facility_id: '', booking_date: '', start_time: '', end_time: '', purpose: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    api.get('/facilities').then((res) => setFacilities(res.data.filter((f) => f.status === 'available')));
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      setError('Could not load your bookings');
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!form.facility_id || !form.booking_date || !form.start_time || !form.end_time) {
      setError('Please fill all required fields');
      return;
    }
    if (form.end_time <= form.start_time) {
      setError('End time must be after start time');
      return;
    }
    try {
      const res = await api.post('/bookings', form);
      setInfo(res.data.message);
      setForm({ facility_id: '', booking_date: '', start_time: '', end_time: '', purpose: '' });
      loadBookings();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function cancelBooking(id) {
    setError('');
    setInfo('');
    try {
      const res = await api.put('/bookings/' + id + '/cancel');
      setInfo(res.data.message);
      loadBookings();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <Link to="/athlete" className="text-blue-700">Back to dashboard</Link>
      <h1 className="text-2xl font-bold text-blue-800 mt-2 mb-4">Book a Facility</h1>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded shadow mb-8 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Facility</label>
          <select name="facility_id" value={form.facility_id} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Select a facility</option>
            {facilities.map((f) => (
              <option key={f.facility_id} value={f.facility_id}>{f.name} ({f.sport}, {f.location})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Date</label>
          <input type="date" name="booking_date" value={form.booking_date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Start time</label>
          <input type="time" name="start_time" value={form.start_time} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">End time</label>
          <input type="time" name="end_time" value={form.end_time} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1">Purpose</label>
          <input type="text" name="purpose" value={form.purpose} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="bg-blue-800 text-white px-5 py-2 rounded">Send booking request</button>
        </div>
      </form>

      <h2 className="text-xl font-bold text-blue-800 mb-3">My bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-600">You have no bookings yet.</p>
      ) : (
        <table className="w-full bg-white shadow text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Facility</th>
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.booking_id} className="border-t">
                <td className="p-2">{b.facility_name}</td>
                <td className="p-2">{b.booking_date}</td>
                <td className="p-2">{b.start_time} to {b.end_time}</td>
                <td className="p-2">{b.purpose}</td>
                <td className="p-2">{b.status}</td>
                <td className="p-2">
                  {(b.status === 'pending' || b.status === 'approved') && (
                    <button onClick={() => cancelBooking(b.booking_id)} className="text-red-700">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BookFacility;
