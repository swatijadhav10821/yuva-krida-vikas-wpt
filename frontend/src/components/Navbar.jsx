   import { useContext } from 'react';
   import { Link, useNavigate } from 'react-router-dom';
   import { AuthContext } from '../context/AuthContext';

   function Navbar() {
     const { user, logout } = useContext(AuthContext);
     const navigate = useNavigate();

     function dashboardPath(role) {
       if (role === 'admin') return '/admin';
       if (role === 'coach') return '/coach';
       return '/athlete';
     }

     function handleLogout() {
       logout();
       navigate('/');
     }

     return (
       <nav className="bg-blue-800 text-white px-6 py-3 flex items-center justify-between">
         <Link to="/" className="text-xl font-bold">Yuva Krida Vikas</Link>
         <div className="flex items-center gap-5">
           <Link to="/">Home</Link>
           <Link to="/tournaments">Tournaments</Link>
           <Link to="/about">About</Link>
           <Link to="/contact">Contact</Link>
           {user ? (
             <>
               <Link to={dashboardPath(user.role)}>Dashboard</Link>
               <span className="text-sm text-blue-200">{user.name}</span>
               <button onClick={handleLogout} className="bg-white text-blue-800 px-3 py-1 rounded">Logout</button>
             </>
           ) : (
             <>
               <Link to="/login">Login</Link>
               <Link to="/register" className="bg-white text-blue-800 px-3 py-1 rounded">Register</Link>
             </>
           )}
         </div>
       </nav>
     );
   }

   export default Navbar;