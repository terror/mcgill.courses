import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { User, UserResponse } from '../types/user';
import { fetchClient } from '../utils/fetchClient';

export const authContext = createContext<User | undefined>(undefined);

const AuthProvider = ({ children }: PropsWithChildren<any>) => {
  const [user, setUser] = useState<User>();
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    setStatus('pending');
    fetchClient
      .getData<UserResponse>('/auth/user', { credentials: 'include' })
      .then((data) => {
        setUser(data.user);
        setStatus('success');
      });
  }, []);

  return status === 'pending' ? (
    <div>Loading...</div>
  ) : (
    <authContext.Provider value={user}>{children}</authContext.Provider>
  );
};

export default AuthProvider;
