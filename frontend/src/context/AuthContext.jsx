   import { createContext, useState, useEffect } from 'react';
   import api from '../api';

   export const AuthContext = createContext();

   export function AuthProvider({ children }) {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const token = localStorage.getItem('token');
       if (!token) {
         setLoading(false);
         return;
       }
       api.get('/me')
         .then((res) => setUser(res.data))
         .catch(() => localStorage.removeItem('token'))
         .finally(() => setLoading(false));
     }, []);

     function login(token, userData) {
       localStorage.setItem('token', token);
       setUser(userData);
     }

     function logout() {
       localStorage.removeItem('token');
       setUser(null);
     }

     return (
       <AuthContext.Provider value={{ user, loading, login, logout }}>
         {children}
       </AuthContext.Provider>
     );
   }