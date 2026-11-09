import { useState } from 'react';
import api from '../api';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.email || !form.message) {
      setError('Please fill all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email');
      return;
    }

    if (form.message.length > 500) {
      setError('Message must be within 500 characters');
      return;
    }

    try {
      await api.post('/messages', form);
      setSuccess('Thank you. Your message has been sent.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError('Cannot reach the server');
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto my-10 px-6 grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-3xl font-bold text-blue-800 mb-4">Contact Us</h1>
        <p className="mb-6 text-gray-700">
          Have a question about tournaments, training or booking a facility? Send us a message and we will reply soon.
        </p>
        <p className="mb-2"><span className="font-semibold">Address:</span> Yuva Krida Vikas Office, Shivajinagar, Pune</p>
        <p className="mb-2"><span className="font-semibold">Phone:</span> 020 2345 6789</p>
        <p className="mb-2"><span className="font-semibold">Email:</span> info@ykv.com</p>
        <p><span className="font-semibold">Hours:</span> Monday to Saturday, 9 am to 6 pm</p>
      </div>

      <div className="bg-white p-6 rounded shadow">
        {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}
        {success && <p className="bg-green-100 text-green-700 px-3 py-2 rounded mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block mb-1">Email</label>
          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="block mb-1">Message</label>
          <textarea
            name="message"
            rows="5"
            value={form.message}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-4"
          ></textarea>

          <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded">Send message</button>
        </form>
      </div>
    </div>
  );
}

export default Contact;