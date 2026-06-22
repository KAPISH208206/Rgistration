import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps a route element and redirects to /login if no user is signed in.
// Remembers where the person was headed (e.g. a share link) via location state,
// so Login can send them back there once they're authenticated.
function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default RequireAuth;
