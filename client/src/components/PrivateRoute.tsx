import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export const PrivateRoute = ({ children }: any) => {
  return !useAuth() ? <Navigate to='/' replace /> : children;
};
