import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../context/AuthContext';

const emptyForm = { facility_id: '', title: '', training_date: '', start_time: '', end_time: '', seats: '' };

function CoachDashboard() {
  const { user } = useContext(AuthContext);
  const [trainings, setTrainings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadTrainings();
    api.get('/facilities').then((res) => setFacilities(res.data.filter((f) => f.status === 'available')));
  }, []);

  async function loadTrainings() {
    try {
      const res = await api.get('/trainings/mine');
      setTrainings(res.data);
    } catch (err) {
      setError('Could not load trainings');
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(t) {
    setEditId(t.training_id);
    setForm({
      facility_id: t.facility_id,
      title: t.title,
      training_date: t.training_date,
      start_time: t.start_time,
      end_time: t.end_time,
      seats: t.seats
    });
    window.scrollTo(0, 0);
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!form.facility_id || !form.title || !form.training_date || !form.start_time || !form.end_time || !form.seats) {
      setError('Please fill all fields');
      return;
    }
    if (form.end_time <= form.start_time) {
      setError('End time must be after start time');
      return;
    }
    try {
      let res;
      if (editId) {
        res = await api.put('/trainings/' + editId, form);
      } else {
        res = await api.post('/trainings', form);
      }
      setInfo(res.data.message);
      cancelEdit();
      loadTrainings();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function deleteTraining(id) {
    setError('');
    setInfo('');
    if (!window.confirm('Delete this training?')) return;
    try {
      const res = await api.delete('/trainings/' + id);
      setInfo(res.data.message);
      loadTrainings();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <h1 className="text-2xl font-bold text-blue-800 mb-1">Coach Dashboard</h1>
      <p className="text-gray-700 mb-4">Welcome, {user.name}</p>

      <div className="mb-6">
        <Link to="/coach/scores" className="bg-blue-800 text-white px-4 py-2 rounded mr-3">Enter match scores</Link>
        <Link to="/coach/messages" className="bg-blue-800 text-white px-4 py-2 rounded mr-3">My messages</Link>
        <Link to="/tournaments" className="bg-blue-800 text-white px-4 py-2 rounded">Tournaments</Link>
      </div>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      <h2 className="text-xl font-bold text-blue-800 mb-2">{editId ? 'Edit training' : 'Add a training'}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded shadow mb-8 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Facility</label>
          <select name="facility_id" value={form.facility_id} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Select a facility</option>
            {facilities.map((f) => (
              <option key={f.facility_id} value={f.facility_id}>{f.name} ({f.sport})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Date</label>
          <input type="date" name="training_date" value={form.training_date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Seats</label>
          <input type="number" name="seats" value={form.seats} onChange={handleChange} className="w-full border rounded px-3 py-2" />
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
          <button type="submit" className="bg-blue-800 text-white px-5 py-2 rounded mr-3">{editId ? 'Save changes' : 'Add training'}</button>
          {editId && <button type="button" onClick={cancelEdit} className="text-gray-600">Cancel</button>}
        </div>
      </form>

      <h2 className="text-xl font-bold text-blue-800 mb-2">My trainings</h2>
      {trainings.length === 0 ? (
        <p className="text-gray-600">You have not added any training.</p>
      ) : (
        <table className="w-full bg-white shadow text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Facility</th>
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Seats left</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainings.map((t) => (
              <tr key={t.training_id} className="border-t">
                <td className="p-2">{t.title}</td>
                <td className="p-2">{t.facility_name}</td>
                <td className="p-2">{t.training_date}</td>
                <td className="p-2">{t.start_time} to {t.end_time}</td>
                <td className="p-2">{t.seats_left} of {t.seats}</td>
                <td className="p-2">
                  <Link to={'/coach/trainings/' + t.training_id} className="text-blue-700 mr-2">Attendance</Link>
                  <button onClick={() => startEdit(t)} className="text-blue-700 mr-2">Edit</button>
                  <button onClick={() => deleteTraining(t.training_id)} className="text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CoachDashboard;
