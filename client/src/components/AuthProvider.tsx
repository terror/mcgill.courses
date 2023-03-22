import { createContext, PropsWithChildren, useEffect, useState } from 'react';
import { User } from '../types/types';

export const authContext = createContext<User | undefined>(undefined);

const AuthProvider = ({ children }: PropsWithChildren<any>) => {
  const [user, setUser] = useState<User>();
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    setStatus('pending');
    fetch('http://localhost:8000/auth/user', { credentials: 'include' }).then(
      (res) => {
        res.json().then((data) => {
          console.log(data);
          setUser(data as User);
          setStatus('success');
        });
      }
    );
  }, []);

  return status === 'pending' ? (
    <div>Loading...</div>
  ) : (
    <authContext.Provider value={user}>{children}</authContext.Provider>
  );
};

export default AuthProvider;
