import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { NotFound as NotFoundContent } from '../components/NotFound';

export const NotFound = () => {
  const nav = useNavigate();

  return (
    <Layout>
      <NotFoundContent />
    </Layout>
  );
};
