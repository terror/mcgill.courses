import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';

export const Loading = () => (
  <Layout>
    <div className='flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <Spinner />
      </div>
    </div>
  </Layout>
);
