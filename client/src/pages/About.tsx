import React from 'react';

import { Layout } from '../components/Layout';

export const About = () => {
  return (
    <Layout>
      <div className='mt-28 mx-4 flex flex-col justify-center align-middle text-center sm:mt-32'>
        <h1 className='mb-auto mt text-4xl font-bold text-gray-700'>
          About Us
        </h1>
        <hr className='border-gray-200 w-32 mx-auto my-5 mb-8 text-4xl' />
        <p className='text-gray-700 text-xl mx-5 sm:mx-0'>
          {' '}
          [name] is an open-source, student-made review website for courses
          offered and instructors teaching at McGill University.
        </p>
        <div className='border-gray-400'></div>
      </div>
    </Layout>
  );
};
