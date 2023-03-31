import { useContext } from 'react';

import { AuthContext } from '../providers/AuthProvider';

export const useAuth = () => {
  return useContext(AuthContext);
};
