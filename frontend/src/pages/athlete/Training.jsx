import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function Training() {
  const [trainings, setTrainings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const t = await api.get('/trainings');
      setTrainings(t.data);
      const e = await api.get('/enrollments/my');
      setEnrollments(e.data);
    } catch (err) {
      setError('Could not load trainings');
    }
  }

  async function enroll(id) {
    setError('');
    setInfo('');
    try {
      const res = await api.post('/enrollments', { training_id: id });
      setInfo(res.data.message);
      loadAll();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function leave(id) {
    setError('');
    setInfo('');
    try {
      const res = await api.delete('/enrollments/' + id);
      setInfo(res.data.message);
      loadAll();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  function isEnrolled(trainingId) {
    return enrollments.some((e) => e.training_id === trainingId);
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <Link to="/athlete" className="text-blue-700">Back to dashboard</Link>
      <h1 className="text-2xl font-bold text-blue-800 mt-2 mb-4">Training Programs</h1>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      <table className="w-full bg-white shadow text-left mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Coach</th>
            <th className="p-2">Facility</th>
            <th className="p-2">Date</th>
            <th className="p-2">Time</th>
            <th className="p-2">Seats left</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {trainings.map((t) => (
            <tr key={t.training_id} className="border-t">
              <td className="p-2">{t.title}</td>
              <td className="p-2">{t.coach_name}</td>
              <td className="p-2">{t.facility_name}</td>
              <td className="p-2">{t.training_date}</td>
              <td className="p-2">{t.start_time} to {t.end_time}</td>
              <td className="p-2">{t.seats_left}</td>
              <td className="p-2">
                {isEnrolled(t.training_id) ? (
                  <span className="text-green-700">Enrolled</span>
                ) : t.seats_left > 0 ? (
                  <button onClick={() => enroll(t.training_id)} className="text-blue-700">Enroll</button>
                ) : (
                  <span className="text-gray-500">Full</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold text-blue-800 mb-3">My enrollments</h2>
      {enrollments.length === 0 ? (
        <p className="text-gray-600">You have not enrolled in any training.</p>
      ) : (
        <table className="w-full bg-white shadow text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Date</th>
              <th className="p-2">Attendance</th>
              <th className="p-2">Remark</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.enrollment_id} className="border-t">
                <td className="p-2">{e.title}</td>
                <td className="p-2">{e.training_date}</td>
                <td className="p-2">{e.attendance}</td>
                <td className="p-2">{e.remark}</td>
                <td className="p-2">
                  <button onClick={() => leave(e.enrollment_id)} className="text-red-700">Leave</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Training;
