import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
    } else if (roles && !roles.includes(user.role)) {
      navigate('/');
    }
  }, [loading, user, roles, navigate]);

  if (loading) {
    return <p className="p-6">Loading...</p>;
  }

  if (!user || (roles && !roles.includes(user.role))) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
