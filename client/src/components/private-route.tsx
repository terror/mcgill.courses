import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth';

export const PrivateRoute = ({ children }: any) => {
  return !useAuth() ? <Navigate to='/' replace /> : children;
};
