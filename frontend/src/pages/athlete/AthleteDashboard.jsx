import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';

function AthleteDashboard() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const b = await api.get('/bookings/my');
      setBookings(b.data);
      const e = await api.get('/enrollments/my');
      setEnrollments(e.data);
      const r = await api.get('/registrations/my');
      setRegistrations(r.data);
    } catch (err) {
      setError('Could not load your data');
    }
  }

  async function withdraw(id) {
    setError('');
    setInfo('');
    try {
      const res = await api.put('/registrations/' + id + '/withdraw');
      setInfo(res.data.message);
      loadAll();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-1">Athlete Dashboard</h1>
      <p className="text-gray-700 mb-4">Welcome, {user.name}</p>

      <div className="mb-6">
        <Link to="/athlete/book" className="bg-blue-800 text-white px-4 py-2 rounded mr-3">Book a facility</Link>
        <Link to="/athlete/training" className="bg-blue-800 text-white px-4 py-2 rounded mr-3">Training programs</Link>
        <Link to="/tournaments" className="bg-blue-800 text-white px-4 py-2 rounded">Tournaments</Link>
      </div>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      <h2 className="text-xl font-bold text-blue-800 mb-2">My bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-600 mb-6">No bookings yet.</p>
      ) : (
        <table className="w-full bg-white shadow text-left mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Facility</th>
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.booking_id} className="border-t">
                <td className="p-2">{b.facility_name}</td>
                <td className="p-2">{b.booking_date}</td>
                <td className="p-2">{b.start_time} to {b.end_time}</td>
                <td className="p-2">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="text-xl font-bold text-blue-800 mb-2">My trainings</h2>
      {enrollments.length === 0 ? (
        <p className="text-gray-600 mb-6">No trainings yet.</p>
      ) : (
        <table className="w-full bg-white shadow text-left mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Date</th>
              <th className="p-2">Attendance</th>
              <th className="p-2">Remark</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.enrollment_id} className="border-t">
                <td className="p-2">{e.title}</td>
                <td className="p-2">{e.training_date}</td>
                <td className="p-2">{e.attendance}</td>
                <td className="p-2">{e.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 className="text-xl font-bold text-blue-800 mb-2">My tournaments</h2>
      {registrations.length === 0 ? (
        <p className="text-gray-600">No tournament registrations yet.</p>
      ) : (
        <table className="w-full bg-white shadow text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Tournament</th>
              <th className="p-2">Start date</th>
              <th className="p-2">Registration</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r.registration_id} className="border-t">
                <td className="p-2">
                  <Link to={'/tournaments/' + r.tournament_id} className="text-blue-700">{r.title}</Link>
                </td>
                <td className="p-2">{r.start_date}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">
                  {r.status === 'registered' && r.tournament_status === 'upcoming' && (
                    <button onClick={() => withdraw(r.registration_id)} className="text-red-700">Withdraw</button>
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

export default AthleteDashboard;
