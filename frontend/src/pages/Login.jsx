   import { useState, useContext } from 'react';
   import { Link, Navigate, useNavigate } from 'react-router-dom';
   import api from '../api';
   import { AuthContext } from '../context/AuthContext';

   function Login() {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const { user, login } = useContext(AuthContext);
     const navigate = useNavigate();

     function dashboardPath(role) {
       if (role === 'admin') return '/admin';
       if (role === 'coach') return '/coach';
       return '/athlete';
     }

     async function handleSubmit(e) {
       e.preventDefault();
       setError('');

       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         setError('Enter a valid email');
         return;
       }

       if (password.length < 6) {
         setError('Password must be at least 6 characters');
         return;
       }

       try {
         const res = await api.post('/login', { email, password });
         login(res.data.token, res.data.user);
         navigate(dashboardPath(res.data.user.role));
       } catch (err) {
         if (err.response) {
           setError(err.response.data.message);
         } else {
           setError('Cannot reach the server');
         }
       }
     }

     if (user) {
       return <Navigate to={'/' + user.role} />;
     }

     return (
       <div
         className="photo-bg min-h-[calc(100vh-7.5rem)] flex items-center justify-center px-6 py-10"
         style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(/images/stadium.jpg)' }}
       >
       <div className="w-full max-w-md bg-white p-8 rounded shadow-lg">
         <h1 className="text-2xl font-bold text-blue-800 mb-6">Login</h1>

         {error && <p className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</p>}

         <form onSubmit={handleSubmit}>
           <label className="block mb-1">Email</label>
           <input
             type="text"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             className="w-full border rounded px-3 py-2 mb-4"
           />

           <label className="block mb-1">Password</label>
           <input
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="w-full border rounded px-3 py-2 mb-6"
           />

           <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded">Login</button>
         </form>

         <p className="mt-4 text-sm">
           New here? <Link to="/register" className="text-blue-800 underline">Create an account</Link>
         </p>
       </div>
       </div>
     );
   }

   export default Login;