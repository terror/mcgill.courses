import { useContext } from 'react';
import { authContext } from '../components/AuthProvider';

export const useAuth = () => {
  return useContext(authContext);
};
