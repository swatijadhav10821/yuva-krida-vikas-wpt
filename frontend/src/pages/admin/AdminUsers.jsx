import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function AdminUsers() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadUsers();
    loadMessages();
  }, []);

  async function loadUsers() {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError('Could not load users');
    }
  }

  async function loadMessages() {
    try {
      const res = await api.get('/messages');
      setMessages(res.data);
    } catch (err) {
      setError('Could not load messages');
    }
  }

  function startEdit(u) {
    setEditId(u.user_id);
    setEditForm({
      name: u.name,
      phone: u.phone || '',
      district: u.district || '',
      sport: u.sport || '',
      role: u.role,
      status: u.status
    });
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function saveEdit() {
    setError('');
    setInfo('');
    try {
      await api.put('/users/' + editId, editForm);
      setInfo('User updated');
      setEditId(null);
      loadUsers();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function deleteUser(id) {
    setError('');
    setInfo('');
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete('/users/' + id);
      setInfo('User deleted');
      loadUsers();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function sendReply(id) {
    setError('');
    setInfo('');
    if (!replyText) {
      setError('Write a reply first');
      return;
    }
    try {
      await api.put('/messages/' + id + '/reply', { reply: replyText });
      setInfo('Reply saved');
      setReplyId(null);
      setReplyText('');
      loadMessages();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  async function deleteMessage(id) {
    setError('');
    setInfo('');
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete('/messages/' + id);
      setInfo('Message deleted');
      loadMessages();
    } catch (err) {
      setError(err.response ? err.response.data.message : 'Cannot reach the server');
    }
  }

  return (
    <div className="max-w-6xl mx-auto my-8 px-6">
      <Link to="/admin" className="text-blue-700">Back to Dashboard</Link>
      <h1 className="text-2xl font-bold text-blue-800 mt-2 mb-4">Users and Messages</h1>

      <div className="mb-4">
        <button
          onClick={() => setTab('users')}
          className={'px-4 py-2 rounded mr-2 ' + (tab === 'users' ? 'bg-blue-800 text-white' : 'bg-gray-200')}
        >
          Users
        </button>
        <button
          onClick={() => setTab('messages')}
          className={'px-4 py-2 rounded ' + (tab === 'messages' ? 'bg-blue-800 text-white' : 'bg-gray-200')}
        >
          Messages
        </button>
      </div>

      {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
      {info && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{info}</p>}

      {tab === 'users' && (
        <table className="w-full bg-white shadow text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Phone</th>
              <th className="p-2">District</th>
              <th className="p-2">Sport</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) =>
              editId === u.user_id ? (
                <tr key={u.user_id} className="border-t">
                  <td className="p-2">{u.user_id}</td>
                  <td className="p-2"><input name="name" value={editForm.name} onChange={handleEditChange} className="border rounded px-1 w-28" /></td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2"><input name="phone" value={editForm.phone} onChange={handleEditChange} className="border rounded px-1 w-24" /></td>
                  <td className="p-2"><input name="district" value={editForm.district} onChange={handleEditChange} className="border rounded px-1 w-24" /></td>
                  <td className="p-2"><input name="sport" value={editForm.sport} onChange={handleEditChange} className="border rounded px-1 w-24" /></td>
                  <td className="p-2">
                    <select name="role" value={editForm.role} onChange={handleEditChange} className="border rounded">
                      <option value="athlete">athlete</option>
                      <option value="coach">coach</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <select name="status" value={editForm.status} onChange={handleEditChange} className="border rounded">
                      <option value="active">active</option>
                      <option value="blocked">blocked</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <button onClick={saveEdit} className="text-green-700 mr-2">Save</button>
                    <button onClick={() => setEditId(null)} className="text-gray-600">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={u.user_id} className="border-t">
                  <td className="p-2">{u.user_id}</td>
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.phone}</td>
                  <td className="p-2">{u.district}</td>
                  <td className="p-2">{u.sport}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.status}</td>
                  <td className="p-2">
                    <button onClick={() => startEdit(u)} className="text-blue-700 mr-2">Edit</button>
                    <button onClick={() => deleteUser(u.user_id)} className="text-red-700">Delete</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}

      {tab === 'messages' && (
        <div>
          {messages.length === 0 && <p className="text-gray-600">No messages.</p>}
          {messages.map((m) => (
            <div key={m.message_id} className="bg-white p-4 rounded shadow mb-4">
              <p className="font-semibold">
                {m.name} <span className="text-gray-500 font-normal">({m.email})</span>
                <span className={'ml-3 text-sm ' + (m.status === 'new' ? 'text-red-600' : 'text-green-700')}>{m.status}</span>
              </p>
              <p className="text-gray-500 text-sm mb-2">{m.created_at}</p>
              <p className="mb-2">{m.message}</p>
              {m.reply && <p className="bg-gray-100 p-2 rounded mb-2">Reply: {m.reply}</p>}

              {replyId === m.message_id ? (
                <div>
                  <textarea
                    rows="3"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full border rounded px-2 py-1 mb-2"
                  ></textarea>
                  <button onClick={() => sendReply(m.message_id)} className="text-green-700 mr-3">Save reply</button>
                  <button onClick={() => setReplyId(null)} className="text-gray-600">Cancel</button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => { setReplyId(m.message_id); setReplyText(m.reply || ''); }}
                    className="text-blue-700 mr-3"
                  >
                    Reply
                  </button>
                  <button onClick={() => deleteMessage(m.message_id)} className="text-red-700">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminUsers;