import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function EnterScores() {
  const [matches, setMatches] = useState([]);
  const [scores, setScores] = useState({});
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const res = await api.get('/matches');
      setMatches(res.data);
      const start = {};
      res.data.forEach((m) => {
        if (m.score) {
          start[m.match_id] = { a: m.score[m.team_a], b: m.score[m.team_b] };
        } else {
          start[m.match_id] = { a: '', b: '' };
        }
      });
      setScores(start);
    } catch (err) {
      setError('Could not load matches');
    }
  }

  function changeScore(matchId, side, value) {
    setScores({ ...scores, [matchId]: { ...scores[matchId], [side]: value } });
  }

  async function saveScore(m) {
    setError('');
    setInfo('');
    const s = scores[m.match_id];
    if (s.a === '' || s.b === '') {
      setError('Enter the score of both teams');
      return;
    }
    try {
      const res = await api.put('/matches/' + m.match_id + '/score', { score_a: s.a, score_b: s.b });
      setInfo('Score saved. Winner: ' + res.data.winner);
      loadMatches();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-6">
      <Link to="/coach" className="text-blue-700">Back to dashboard</Link>
      <h1 className="text-2xl font-bold text-blue-800 mt-2 mb-4">Enter Match Scores</h1>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      {matches.length === 0 ? (
        <p className="text-gray-600">No matches have been scheduled.</p>
      ) : (
        <table className="w-full bg-white shadow text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Tournament</th>
              <th className="p-2">Date</th>
              <th className="p-2">Match</th>
              <th className="p-2">Score</th>
              <th className="p-2">Winner</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.match_id} className="border-t">
                <td className="p-2">{m.tournament_title}</td>
                <td className="p-2">{m.match_date} {m.match_time}</td>
                <td className="p-2">{m.team_a} vs {m.team_b}</td>
                <td className="p-2">
                  <input
                    type="number"
                    value={scores[m.match_id] ? scores[m.match_id].a : ''}
                    onChange={(e) => changeScore(m.match_id, 'a', e.target.value)}
                    className="border rounded px-2 py-1 w-16 mr-1"
                  />
                  -
                  <input
                    type="number"
                    value={scores[m.match_id] ? scores[m.match_id].b : ''}
                    onChange={(e) => changeScore(m.match_id, 'b', e.target.value)}
                    className="border rounded px-2 py-1 w-16 ml-1"
                  />
                </td>
                <td className="p-2">{m.winner || '-'}</td>
                <td className="p-2">
                  <button onClick={() => saveScore(m)} className="text-green-700">Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EnterScores;
