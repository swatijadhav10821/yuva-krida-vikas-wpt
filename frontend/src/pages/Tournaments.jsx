import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

function Tournaments() {
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tournaments')
      .then((res) => setTournaments(res.data))
      .catch(() => setError('Could not load tournaments'));
  }, []);

  const shown = tournaments.filter((t) => filter === 'all' || t.status === filter);

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      {user && <Link to={'/' + user.role} className="text-blue-700">Back to Dashboard</Link>}
      <h1 className="text-3xl font-bold text-blue-800 mt-2 mb-4">Tournaments</h1>

      <div className="mb-4">
        <label className="mr-2">Show:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {shown.length === 0 && !error && <p className="text-gray-600">No tournaments found.</p>}

      <div className="grid md:grid-cols-2 gap-4">
        {shown.map((t) => (
          <div key={t.tournament_id} className="bg-white p-5 rounded shadow">
            <h2 className="text-xl font-semibold mb-1">{t.title}</h2>
            <p className="text-gray-600">{t.sport} at {t.facility_name}, {t.location}</p>
            <p className="text-gray-600">{t.start_date} to {t.end_date}</p>
            <p className="text-gray-600">Register by {t.last_date}</p>
            <p className="text-gray-600 mb-3">Status: {t.status} | Registered: {t.registered_count}</p>
            <Link to={'/tournaments/' + t.tournament_id} className="text-blue-700 font-semibold">View details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tournaments;
