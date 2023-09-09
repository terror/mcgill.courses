import { PropsWithChildren, createContext, useEffect, useState } from 'react';

import { fetchClient } from '../lib/fetchClient';
import { User, UserResponse } from '../model/User';

export const AuthContext = createContext<User | undefined>(undefined);

const AuthProvider = ({ children }: PropsWithChildren<any>) => {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchClient
      .deserialize<UserResponse>('GET', '/user', { credentials: 'include' })
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
