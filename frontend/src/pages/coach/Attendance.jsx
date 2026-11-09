import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

function Attendance() {
  const { id } = useParams();
  const [training, setTraining] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const res = await api.get('/enrollments/training/' + id);
      setTraining(res.data.training);
      setRows(res.data.enrollments.map((e) => ({ ...e, remark: e.remark || '' })));
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  function changeRow(enrollmentId, field, value) {
    setRows(rows.map((r) => (r.enrollment_id === enrollmentId ? { ...r, [field]: value } : r)));
  }

  async function saveRow(row) {
    setError('');
    setInfo('');
    try {
      await api.put('/enrollments/' + row.enrollment_id + '/attendance', {
        attendance: row.attendance,
        remark: row.remark
      });
      setInfo('Attendance saved for ' + row.name);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <Link to="/coach" className="text-blue-700">Back to dashboard</Link>
      <h1 className="text-2xl font-bold text-blue-800 mt-2 mb-1">Attendance</h1>
      {training && (
        <p className="text-gray-700 mb-4">{training.title} on {training.training_date}, {training.start_time} to {training.end_time}</p>
      )}

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      {training && rows.length === 0 && <p className="text-gray-600">No athletes have enrolled yet.</p>}

      {rows.length > 0 && (
        <table className="w-full bg-white shadow text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Athlete</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Attendance</th>
              <th className="p-2">Remark</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.enrollment_id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.phone}</td>
                <td className="p-2">
                  <select
                    value={r.attendance}
                    onChange={(e) => changeRow(r.enrollment_id, 'attendance', e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="pending">pending</option>
                    <option value="present">present</option>
                    <option value="absent">absent</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={r.remark}
                    onChange={(e) => changeRow(r.enrollment_id, 'remark', e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>
                <td className="p-2">
                  <button onClick={() => saveRow(r)} className="text-green-700">Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Attendance;
