import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

export const Profile = () => {
  const user = useAuth();
  return (
    <Layout>
      <h1>User: {user?.mail}</h1>
    </Layout>
  );
};
