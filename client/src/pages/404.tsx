import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';

export const NotFound404 = () => {
  const nav = useNavigate();

  return (
    <Layout>
      <div className='flex min-h-[calc(100vh-96px)]  flex-col items-center justify-center'>
        <div className='space-y-9 text-center'>
          <h1 className='text-8xl font-bold text-gray-900 dark:text-gray-200'>
            404
          </h1>
          <p className='font-medium text-gray-800 dark:text-gray-300'>
            Uh oh, it looks like you are are lost.
          </p>
          <button
            onClick={() => nav('/')}
            className='mx-auto max-w-fit rounded-full border px-5 py-2 font-semibold text-gray-800 transition duration-300 ease-in-out hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800'
          >
            Home
          </button>
        </div>
      </div>
    </Layout>
  );
};
