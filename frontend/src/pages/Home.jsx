import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function Home() {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    api.get('/tournaments')
      .then((res) => setTournaments(res.data.slice(0, 3)))
      .catch(() => setTournaments([]));
  }, []);

  return (
    <div>
      <div className="bg-blue-800 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-3">Yuva Krida Vikas</h1>
        <p className="text-lg mb-6">Train. Book. Compete. One platform for young sportspersons.</p>
        <Link to="/register" className="bg-white text-blue-800 px-6 py-2 rounded font-semibold">
          Join now
        </Link>
      </div>

      <div className="max-w-5xl mx-auto my-10 px-6 grid md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded shadow">
          <h3 className="font-semibold text-blue-800 mb-1">Facility booking</h3>
          <p className="text-gray-700">Book grounds, courts and halls by date and time.</p>
        </div>
        <div className="bg-white p-5 rounded shadow">
          <h3 className="font-semibold text-blue-800 mb-1">Training programs</h3>
          <p className="text-gray-700">Enrol in coaching programs run by experienced coaches.</p>
        </div>
        <div className="bg-white p-5 rounded shadow">
          <h3 className="font-semibold text-blue-800 mb-1">Tournaments</h3>
          <p className="text-gray-700">Register for tournaments and follow the match results.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-10 px-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Upcoming tournaments</h2>
        {tournaments.length === 0 && (
          <p className="text-gray-600">No tournaments to show right now.</p>
        )}
        <div className="grid md:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <div key={t.tournament_id} className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-gray-600">{t.sport}</p>
              <p className="text-gray-600">{t.start_date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;