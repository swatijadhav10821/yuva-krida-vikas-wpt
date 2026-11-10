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
       <nav className="bg-brand-navy text-white px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-2 shadow-md">
         <Link to="/" className="flex items-center gap-2 text-xl font-bold">
           <img src="/logo.png" alt="Yuva Krida Vikas logo" className="h-10 w-10 rounded bg-white" />
           Yuva Krida Vikas
         </Link>
         <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
           <Link className="hover:text-orange-300" to="/">Home</Link>
           <Link className="hover:text-orange-300" to="/tournaments">Tournaments</Link>
           <Link className="hover:text-orange-300" to="/about">About</Link>
           <Link className="hover:text-orange-300" to="/contact">Contact</Link>
           {user ? (
             <>
               <Link className="hover:text-orange-300" to={dashboardPath(user.role)}>Dashboard</Link>
               <span className="text-sm text-blue-200">{user.name}</span>
               <button onClick={handleLogout} className="bg-white text-blue-800 px-3 py-1 rounded">Logout</button>
             </>
           ) : (
             <>
               <Link className="hover:text-orange-300" to="/login">Login</Link>
               <Link to="/register" className="bg-white text-blue-800 px-3 py-1 rounded">Register</Link>
             </>
           )}
         </div>
       </nav>
     );
   }

   export default Navbar;