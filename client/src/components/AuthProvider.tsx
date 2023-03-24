import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { User, UserResponse } from '../types/user';
import { fetchClient } from '../utils/fetchClient';

export const AuthContext = createContext<User | undefined>(undefined);

const AuthProvider = ({ children }: PropsWithChildren<any>) => {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchClient
      .getData<UserResponse>('/user', { credentials: 'include' })
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={user}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
