import { PropsWithChildren, createContext, useEffect, useState } from 'react';
import { User } from '../model/User';
import { repo } from '../lib/repo';
import { toast } from 'sonner';

export const AuthContext = createContext<User | undefined>(undefined);

const AuthProvider = ({ children }: PropsWithChildren<any>) => {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const getUser = async () => {
      try {
        const data = await repo.getUser();
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch user.');
      }
    };

    getUser();
  }, []);

  return (
    <AuthContext.Provider value={user}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
