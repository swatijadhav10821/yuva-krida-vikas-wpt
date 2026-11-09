import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const emptyForm = { name: '', sport: '', location: '', capacity: '', status: 'available' };

function AdminFacilities() {
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadFacilities();
  }, []);

  async function loadFacilities() {
    try {
      const res = await api.get('/facilities');
      setFacilities(res.data);
    } catch (err) {
      setError('Could not load facilities');
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(f) {
    setEditId(f.facility_id);
    setForm({ name: f.name, sport: f.sport, location: f.location, capacity: f.capacity, status: f.status });
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
    if (!form.name || !form.sport || !form.location || !form.capacity) {
      setError('Please fill all fields');
      return;
    }
    if (Number(form.capacity) <= 0) {
      setError('Capacity must be more than 0');
      return;
    }
    try {
      let res;
      if (editId) {
        res = await api.put('/facilities/' + editId, form);
      } else {
        res = await api.post('/facilities', form);
      }
      setInfo(res.data.message);
      cancelEdit();
      loadFacilities();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function deleteFacility(id) {
    setError('');
    setInfo('');
    if (!window.confirm('Delete this facility?')) return;
    try {
      const res = await api.delete('/facilities/' + id);
      setInfo(res.data.message);
      loadFacilities();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <Link to="/admin" className="text-blue-700">Back to dashboard</Link>
      <h1 className="text-2xl font-bold text-blue-800 mt-2 mb-4">Facilities</h1>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      <h2 className="text-xl font-bold text-blue-800 mb-2">{editId ? 'Edit facility' : 'Add a facility'}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded shadow mb-8 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Sport</label>
          <input type="text" name="sport" value={form.sport} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Location</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Capacity</label>
          <input type="number" name="capacity" value={form.capacity} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="available">available</option>
            <option value="closed">closed</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="bg-blue-800 text-white px-5 py-2 rounded mr-3">{editId ? 'Save changes' : 'Add facility'}</button>
          {editId && <button type="button" onClick={cancelEdit} className="text-gray-600">Cancel</button>}
        </div>
      </form>

      <table className="w-full bg-white shadow text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Sport</th>
            <th className="p-2">Location</th>
            <th className="p-2">Capacity</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {facilities.map((f) => (
            <tr key={f.facility_id} className="border-t">
              <td className="p-2">{f.facility_id}</td>
              <td className="p-2">{f.name}</td>
              <td className="p-2">{f.sport}</td>
              <td className="p-2">{f.location}</td>
              <td className="p-2">{f.capacity}</td>
              <td className="p-2">{f.status}</td>
              <td className="p-2">
                <button onClick={() => startEdit(f)} className="text-blue-700 mr-2">Edit</button>
                <button onClick={() => deleteFacility(f.facility_id)} className="text-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminFacilities;
