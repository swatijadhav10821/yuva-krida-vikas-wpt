import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

function showScore(score) {
  if (!score) return '-';
  return Object.keys(score).map((team) => team + ' ' + score[team]).join(' - ');
}

function TournamentDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const res = await api.get('/tournaments/' + id);
      setTournament(res.data);
      const m = await api.get('/matches/tournament/' + id);
      setMatches(m.data);
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function handleRegister() {
    setError('');
    setInfo('');
    try {
      const res = await api.post('/registrations', { tournament_id: id });
      setInfo(res.data.message);
      loadData();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto my-8 px-6">
        {error ? <p className="bg-red-100 text-red-700 px-3 py-2 rounded">{error}</p> : <p>Loading...</p>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-6">
      {user && <Link to={'/' + user.role} className="text-blue-700">Back to Dashboard</Link>}
      <br />
      <Link to="/tournaments" className="text-blue-700">Back to tournaments</Link>
      <h1 className="text-3xl font-bold text-blue-800 mt-2 mb-3">{tournament.title}</h1>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      <div className="bg-white p-5 rounded shadow mb-6">
        <p className="mb-1"><span className="font-semibold">Sport:</span> {tournament.sport}</p>
        <p className="mb-1"><span className="font-semibold">Venue:</span> {tournament.facility_name}, {tournament.location}</p>
        <p className="mb-1"><span className="font-semibold">Dates:</span> {tournament.start_date} to {tournament.end_date}</p>
        <p className="mb-1"><span className="font-semibold">Last date to register:</span> {tournament.last_date}</p>
        <p className="mb-1"><span className="font-semibold">Status:</span> {tournament.status}</p>
        <p className="mb-3"><span className="font-semibold">Registered athletes:</span> {tournament.registered_count}</p>
        {tournament.description && <p className="text-gray-700 mb-3">{tournament.description}</p>}

        {!user && (
          <p>
            <Link to="/login" className="text-blue-700 font-semibold">Login</Link> as an athlete to register.
          </p>
        )}
        {user && user.role === 'athlete' && tournament.status === 'upcoming' && (
          <button onClick={handleRegister} className="bg-blue-800 text-white px-5 py-2 rounded">Register</button>
        )}
      </div>

      <h2 className="text-2xl font-bold text-blue-800 mb-3">Matches</h2>
      {matches.length === 0 ? (
        <p className="text-gray-600">No matches scheduled yet.</p>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TournamentDetails;
