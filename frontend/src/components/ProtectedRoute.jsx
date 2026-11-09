   import { useContext } from 'react';
   import { Navigate } from 'react-router-dom';
   import { AuthContext } from '../context/AuthContext';

   function ProtectedRoute({ children, roles }) {
     const { user, loading } = useContext(AuthContext);

     if (loading) {
       return <p className="p-6">Loading...</p>;
     }

     if (!user) {
       return <Navigate to="/login" />;
     }

     if (roles && !roles.includes(user.role)) {
       return <Navigate to="/" />;
     }

     return children;
   }

   export default ProtectedRoute;