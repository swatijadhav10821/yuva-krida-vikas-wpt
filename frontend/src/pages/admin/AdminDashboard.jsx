import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function AdminDashboard() {
  const [counts, setCounts] = useState({ users: 0, facilities: 0, tournaments: 0, newMessages: 0 });
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const u = await api.get('/users');
      const f = await api.get('/facilities');
      const t = await api.get('/tournaments');
      const m = await api.get('/messages');
      const b = await api.get('/bookings');
      setCounts({
        users: u.data.length,
        facilities: f.data.length,
        tournaments: t.data.length,
        newMessages: m.data.filter((x) => x.status === 'new').length
      });
      setBookings(b.data);
    } catch (err) {
      setError('Could not load dashboard data');
    }
  }

  async function changeStatus(id, status) {
    setError('');
    setInfo('');
    try {
      const res = await api.put('/bookings/' + id + '/status', { status });
      setInfo(res.data.message);
      loadAll();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  const pending = bookings.filter((b) => b.status === 'pending');

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">Admin Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-3xl font-bold text-blue-800">{counts.users}</p>
          <p className="text-gray-600">Users</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-3xl font-bold text-blue-800">{counts.facilities}</p>
          <p className="text-gray-600">Facilities</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-3xl font-bold text-blue-800">{counts.tournaments}</p>
          <p className="text-gray-600">Tournaments</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-3xl font-bold text-blue-800">{counts.newMessages}</p>
          <p className="text-gray-600">New messages</p>
        </div>
      </div>

      <div className="mb-6">
        <Link to="/admin/users" className="bg-blue-800 text-white px-4 py-2 rounded mr-3">Users and messages</Link>
        <Link to="/admin/facilities" className="bg-blue-800 text-white px-4 py-2 rounded mr-3">Facilities</Link>
        <Link to="/admin/tournaments" className="bg-blue-800 text-white px-4 py-2 rounded">Tournaments and matches</Link>
      </div>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      <h2 className="text-xl font-bold text-blue-800 mb-2">Pending booking requests</h2>
      {pending.length === 0 ? (
        <p className="text-gray-600">No pending requests.</p>
      ) : (
        <table className="w-full bg-white shadow text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Athlete</th>
              <th className="p-2">Facility</th>
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((b) => (
              <tr key={b.booking_id} className="border-t">
                <td className="p-2">{b.user_name}</td>
                <td className="p-2">{b.facility_name}</td>
                <td className="p-2">{b.booking_date}</td>
                <td className="p-2">{b.start_time} to {b.end_time}</td>
                <td className="p-2">{b.purpose}</td>
                <td className="p-2">
                  <button onClick={() => changeStatus(b.booking_id, 'approved')} className="text-green-700 mr-2">Approve</button>
                  <button onClick={() => changeStatus(b.booking_id, 'rejected')} className="text-red-700">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;
