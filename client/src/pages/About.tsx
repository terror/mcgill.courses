import React from 'react';
import { AiOutlineGithub } from 'react-icons/ai';
import { FiMail } from 'react-icons/fi';

import { Layout } from '../components/Layout';

export const About = () => {
  return (
    <Layout>
      <div className='mt-28 mx-4 flex flex-col justify-center align-middle text-center sm:mt-32'>
        <h1 className='mb-auto text-4xl font-bold text-gray-700'>About Us</h1>
        <hr className='border-gray-200 w-32 mx-auto my-5 mb-8 text-4xl' />
        <p className='text-gray-700 text-xl mx-10 sm:mx-28 lg:mx-60 leading-loose'>
          {' '}
          mcgill.gg is an open-sourced, student-made review website for courses
          offered and instructors teaching at McGill University. Our platform
          aims to provide transparent and accurate information to help with
          informed decision-making. We encourage contributions from the McGill
          community to ensure the resource remains valuable.
        </p>
        <h1 className='mb-auto mt-10 text-4xl font-bold text-gray-700'>
          Contact Us
        </h1>
        <hr className='border-gray-200 w-32 mx-auto my-5 mb-8 text-4xl' />
        <p className='text-gray-700 text-xl mx-10 sm:mx-28 lg:mx-60 leading-loose'>
          {' '}
          If you have any questions or concerns, please reach out to us on
        </p>
        <div className='flex justify-center m-2'>
          <a href='https://www.github.com/terror/mcgill.gg'>
            <AiOutlineGithub
              className='mx-2 text-gray-500 hover:text-gray-700 transition-colors duration-300'
              size={40}
            ></AiOutlineGithub>
          </a>
          <a href='mailto:'>
            <FiMail
              className='mx-2 text-gray-500 hover:text-gray-700 transition-colors duration-300'
              size={40}
            ></FiMail>
          </a>
        </div>
      </div>
    </Layout>
  );
};
