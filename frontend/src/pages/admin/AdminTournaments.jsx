import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const emptyForm = { title: '', facility_id: '', start_date: '', end_date: '', last_date: '', description: '', status: 'upcoming' };
const emptyMatch = { team_a: '', team_b: '', match_date: '', match_time: '' };

function showScore(score) {
  if (!score) return '-';
  return Object.keys(score).map((team) => team + ' ' + score[team]).join(' - ');
}

function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [matchTournament, setMatchTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchForm, setMatchForm] = useState(emptyMatch);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadTournaments();
    api.get('/facilities').then((res) => setFacilities(res.data));
  }, []);

  async function loadTournaments() {
    try {
      const res = await api.get('/tournaments');
      setTournaments(res.data);
    } catch (err) {
      setError('Could not load tournaments');
    }
  }

  async function loadMatches(tournamentId) {
    try {
      const res = await api.get('/matches/tournament/' + tournamentId);
      setMatches(res.data);
    } catch (err) {
      setError('Could not load matches');
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleMatchChange(e) {
    setMatchForm({ ...matchForm, [e.target.name]: e.target.value });
  }

  function startEdit(t) {
    setEditId(t.tournament_id);
    setForm({
      title: t.title,
      facility_id: t.facility_id,
      start_date: t.start_date,
      end_date: t.end_date,
      last_date: t.last_date,
      description: t.description || '',
      status: t.status
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
    if (!form.title || !form.facility_id || !form.start_date || !form.end_date || !form.last_date) {
      setError('Please fill all required fields');
      return;
    }
    if (form.end_date < form.start_date) {
      setError('End date cannot be before start date');
      return;
    }
    if (form.last_date > form.start_date) {
      setError('Last date to register must be on or before the start date');
      return;
    }
    try {
      let res;
      if (editId) {
        res = await api.put('/tournaments/' + editId, form);
      } else {
        res = await api.post('/tournaments', form);
      }
      setInfo(res.data.message);
      cancelEdit();
      loadTournaments();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function deleteTournament(id) {
    setError('');
    setInfo('');
    if (!window.confirm('Delete this tournament with its registrations and matches?')) return;
    try {
      const res = await api.delete('/tournaments/' + id);
      setInfo(res.data.message);
      if (matchTournament && matchTournament.tournament_id === id) {
        setMatchTournament(null);
      }
      loadTournaments();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  function openMatches(t) {
    setMatchTournament(t);
    setMatchForm(emptyMatch);
    loadMatches(t.tournament_id);
  }

  async function addMatch(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!matchForm.team_a || !matchForm.team_b || !matchForm.match_date || !matchForm.match_time) {
      setError('Please fill all match fields');
      return;
    }
    if (matchForm.team_a === matchForm.team_b) {
      setError('Both teams cannot be the same');
      return;
    }
    try {
      const res = await api.post('/matches', { ...matchForm, tournament_id: matchTournament.tournament_id });
      setInfo(res.data.message);
      setMatchForm(emptyMatch);
      loadMatches(matchTournament.tournament_id);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function deleteMatch(id) {
    setError('');
    setInfo('');
    if (!window.confirm('Delete this match?')) return;
    try {
      const res = await api.delete('/matches/' + id);
      setInfo(res.data.message);
      loadMatches(matchTournament.tournament_id);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  return (
    <div className="max-w-6xl mx-auto my-8 px-6">
      <Link to="/admin" className="text-blue-700">Back to dashboard</Link>
      <h1 className="text-2xl font-bold text-blue-800 mt-2 mb-4">Tournaments and Matches</h1>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      <h2 className="text-xl font-bold text-blue-800 mb-2">{editId ? 'Edit tournament' : 'Add a tournament'}</h2>
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
          <label className="block mb-1">Start date</label>
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">End date</label>
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Last date to register</label>
          <input type="date" name="last_date" value={form.last_date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="upcoming">upcoming</option>
            <option value="ongoing">ongoing</option>
            <option value="completed">completed</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1">Description</label>
          <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2"></textarea>
        </div>
        <div className="md:col-span-2">
          <button type="submit" className="bg-blue-800 text-white px-5 py-2 rounded mr-3">{editId ? 'Save changes' : 'Add tournament'}</button>
          {editId && <button type="button" onClick={cancelEdit} className="text-gray-600">Cancel</button>}
        </div>
      </form>

      <table className="w-full bg-white shadow text-left mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Title</th>
            <th className="p-2">Facility</th>
            <th className="p-2">Dates</th>
            <th className="p-2">Register by</th>
            <th className="p-2">Status</th>
            <th className="p-2">Registered</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map((t) => (
            <tr key={t.tournament_id} className="border-t">
              <td className="p-2">{t.title}</td>
              <td className="p-2">{t.facility_name}</td>
              <td className="p-2">{t.start_date} to {t.end_date}</td>
              <td className="p-2">{t.last_date}</td>
              <td className="p-2">{t.status}</td>
              <td className="p-2">{t.registered_count}</td>
              <td className="p-2">
                <button onClick={() => openMatches(t)} className="text-blue-700 mr-2">Matches</button>
                <button onClick={() => startEdit(t)} className="text-blue-700 mr-2">Edit</button>
                <button onClick={() => deleteTournament(t.tournament_id)} className="text-red-700">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {matchTournament && (
        <div>
          <h2 className="text-xl font-bold text-blue-800 mb-2">Matches of {matchTournament.title}</h2>
          <form onSubmit={addMatch} className="bg-white p-5 rounded shadow mb-4 grid md:grid-cols-4 gap-4">
            <div>
              <label className="block mb-1">Team A</label>
              <input type="text" name="team_a" value={matchForm.team_a} onChange={handleMatchChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1">Team B</label>
              <input type="text" name="team_b" value={matchForm.team_b} onChange={handleMatchChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1">Date</label>
              <input type="date" name="match_date" value={matchForm.match_date} onChange={handleMatchChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1">Time</label>
              <input type="time" name="match_time" value={matchForm.match_time} onChange={handleMatchChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-4">
              <button type="submit" className="bg-blue-800 text-white px-5 py-2 rounded">Add match</button>
            </div>
          </form>

          {matches.length === 0 ? (
            <p className="text-gray-600">No matches yet.</p>
          ) : (
            <table className="w-full bg-white shadow text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Teams</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Winner</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.match_id} className="border-t">
                    <td className="p-2">{m.match_date}</td>
                    <td className="p-2">{m.match_time}</td>
                    <td className="p-2">{m.team_a} vs {m.team_b}</td>
                    <td className="p-2">{m.status}</td>
                    <td className="p-2">{showScore(m.score)}</td>
                    <td className="p-2">{m.winner || '-'}</td>
                    <td className="p-2">
                      <button onClick={() => deleteMatch(m.match_id)} className="text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminTournaments;
