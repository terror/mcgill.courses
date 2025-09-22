import { useContext } from 'react';

import { AuthContext } from '../providers/auth-provider';

export const useAuth = () => {
  return useContext(AuthContext);
};
