import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

function MyMessages() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/messages/mine')
      .then((res) => setMessages(res.data))
      .catch(() => setError('Could not load your messages'));
  }, []);

  return (
    <div className="max-w-3xl mx-auto my-8 px-6">
      <Link to={'/' + user.role} className="text-blue-700">Back to Dashboard</Link>
      <h1 className="text-2xl font-bold text-blue-800 mt-2 mb-4">My Messages</h1>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {messages.length === 0 && !error && (
        <p className="text-gray-600">
          You have not sent any messages yet. Use the <Link to="/contact" className="text-blue-700 underline">Contact</Link> page to write to us.
        </p>
      )}

      {messages.map((m) => (
        <div key={m.message_id} className="card mb-4">
          <p className="text-sm text-gray-500 mb-1">Sent on {m.created_at}</p>
          <p className="mb-3"><span className="font-semibold">You:</span> {m.message}</p>
          {m.reply ? (
            <p className="bg-green-50 border-l-4 border-brand-green px-3 py-2">
              <span className="font-semibold">Reply from admin:</span> {m.reply}
            </p>
          ) : (
            <p className="text-gray-600">Waiting for a reply.</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default MyMessages;
