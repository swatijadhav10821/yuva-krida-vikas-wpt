import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const sports = ['Cricket', 'Badminton', 'Shooting', 'Wrestling', 'Hockey'];

function Home() {
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    api.get('/tournaments')
      .then((res) => setTournaments(res.data.slice(0, 3)))
      .catch(() => setTournaments([]));
  }, []);

  return (
    <div>
      <div
        className="photo-bg text-white py-24 px-6 text-center"
        style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(/images/hero.jpg)' }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Yuva Krida Vikas</h1>
        <p className="text-lg md:text-xl mb-8">Train. Book. Compete. One platform for young sportspersons.</p>
        {user ? (
          <Link to={'/' + user.role} className="bg-brand-orange text-white px-6 py-2 rounded font-semibold hover:bg-orange-600">
            Go to my dashboard
          </Link>
        ) : (
          <>
            <Link to="/register" className="bg-brand-orange text-white px-6 py-2 rounded font-semibold mr-3 hover:bg-orange-600">
              Join now
            </Link>
            <Link to="/login" className="border-2 border-white text-white px-6 py-2 rounded font-semibold hover:bg-white hover:text-brand-navy">
              Login
            </Link>
          </>
        )}
      </div>

      <div className="max-w-5xl mx-auto my-10 px-6 grid md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold text-blue-800 mb-1">Facility booking</h3>
          <p className="text-gray-700">Book grounds, courts and halls by date and time.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-blue-800 mb-1">Training programs</h3>
          <p className="text-gray-700">Enrol in coaching programs run by experienced coaches.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-blue-800 mb-1">Tournaments</h3>
          <p className="text-gray-700">Register for tournaments and follow the match results.</p>
        </div>
      </div>

      <div className="bg-white py-10">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Focus sports</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sports.map((sport) => (
              <div key={sport} className="relative overflow-hidden rounded shadow">
                <img
                  src={'/images/' + sport.toLowerCase() + '.jpg'}
                  alt={sport}
                  className="w-full h-64 object-cover transition duration-300 hover:scale-105"
                />
                <p className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-center font-semibold py-2">
                  {sport}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto my-10 px-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Upcoming tournaments</h2>
        {tournaments.length === 0 && (
          <p className="text-gray-600">No tournaments to show right now.</p>
        )}
        <div className="grid md:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <div key={t.tournament_id} className="card">
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-gray-600">{t.start_date}</p>
              <p className="text-gray-600">{t.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
