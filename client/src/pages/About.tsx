import React from 'react';
import { AiOutlineGithub } from 'react-icons/ai';
import { FiMail } from 'react-icons/fi';

import { Layout } from '../components/Layout';

export const About = () => {
  return (
    <Layout>
      <div className='mx-4 mt-28 flex flex-col justify-center text-center align-middle sm:mt-32'>
        <h1 className='mb-auto text-4xl font-bold text-gray-700 dark:text-gray-200'>
          About Us
        </h1>
        <hr className='mx-auto my-5 mb-8 w-32 border-gray-200 text-4xl' />
        <p className='mx-10 text-xl leading-loose text-gray-700 dark:text-gray-200 sm:mx-28 lg:mx-60'>
          {' '}
          mcgill.gg is an open-sourced, student-made review website for courses
          offered and instructors teaching at McGill University. Our platform
          aims to provide transparent and accurate information to help with
          informed decision-making. We encourage contributions from the McGill
          community to ensure the resource remains valuable.
        </p>
        <h1 className='mb-auto mt-10 text-4xl font-bold text-gray-700 dark:text-gray-200'>
          Contact Us
        </h1>
        <hr className='mx-auto my-5 mb-8 w-32 border-gray-200 text-4xl' />
        <p className='mx-10 text-xl leading-loose text-gray-700 dark:text-gray-200 sm:mx-28 lg:mx-60'>
          {' '}
          If you have any questions or concerns, please reach out to us on
        </p>
        <div className='m-2 flex justify-center'>
          <a href='https://www.github.com/terror/mcgill.gg'>
            <AiOutlineGithub
              className='mx-2 text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
              size={40}
            ></AiOutlineGithub>
          </a>
          <a href='mailto:'>
            <FiMail
              className='mx-2 text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
              size={40}
            ></FiMail>
          </a>
        </div>
      </div>
    </Layout>
  );
};
