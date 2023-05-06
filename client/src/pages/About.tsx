import { Link } from 'react-router-dom';
import { AiOutlineGithub } from 'react-icons/ai';
import { FiMail } from 'react-icons/fi';

import { Layout } from '../components/Layout';

import { Disclosure } from '@headlessui/react';
import { IoIosArrowDown } from 'react-icons/io';

type QuestionsAnswersProp = {
  input: {
    title: string;
    content: JSX.Element | string;
  }[];
};

export const QuestionsAnswers = ({ input }: QuestionsAnswersProp) => {
  return (
    <div className='max-w-l mx-10 px-4 sm:mx-20 md:mx-40 lg:mx-60 xl:mx-80'>
      <div className='flex min-w-full max-w-md flex-col items-center justify-center space-y-3 bg-white p-2 dark:bg-neutral-900'>
        {input.map((item: { title: string; content: JSX.Element | string }) => (
          <Disclosure as='div' key={item.title} className='w-full'>
            {({ open }) => (
              <>
                <Disclosure.Button className='mx-auto flex w-full justify-between rounded-lg bg-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-opacity-75 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600'>
                  <span>{item.title}</span>
                  <IoIosArrowDown
                    className={`${
                      open ? 'rotate-180 transform' : ''
                    } h-5 w-5 text-gray-900 dark:text-gray-300`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className='px-4 pt-4 pb-2 text-sm text-gray-700 dark:text-gray-200'>
                  {item.content}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
};

const questionsAnswers = [
  {
    title: 'How do we know that the reviews are legitimate?',
    content:
      'Users are required to authenticate with their McGill email address via Microsoft Office 365. This ensures that only McGill students can leave reviews.',
  },
  {
    title: 'When will instructors ratings be available?',
    content:
      'Instructors ratings are a work in progress. It is our current priority and will be available as soon as possible!',
  },
  {
    title:
      'Are there other similiar tools like mcgill.courses for McGill students?',
    content: (
      <p>
        Yes! There are great student-made tools for McGillians. Some great ones
        are{' '}
        <Link to='https://cloudberry.fyi' className='underline'>
          Cloudberry.fyi
        </Link>{' '}
        and{' '}
        <Link
          to='https://demetrios-koziris.github.io/McGillEnhanced/support'
          className='underline'
        >
          {' '}
          McGill Enhanced
        </Link>
        . We encourage you to explore these tools as well!
      </p>
    ),
  },
];

const Title = ({ title }: { title: string }) => {
  return (
    <div className='mt-10'>
      <h1 className='mb-auto text-4xl font-bold text-gray-700 dark:text-gray-200'>
        {title}
      </h1>
      <hr className='mx-auto my-5 w-32 border-gray-200 text-4xl' />
    </div>
  );
};

export const About = () => {
  return (
    <Layout>
      <div className='my-auto mx-4 flex flex-col justify-center text-center align-middle '>
        <Title title='About Us' />
        <p className='mx-10 text-xl leading-loose text-gray-700 dark:text-gray-200 sm:mx-28 lg:mx-60'>
          {' '}
          mcgill.courses is an open-sourced, student-made review website for
          courses offered and instructors teaching at McGill University. Our
          platform aims to provide transparent and accurate information to help
          with informed decision-making. We encourage contributions from the
          McGill community to ensure the resource remains valuable.
        </p>
        <Title title='FAQ' />
        <QuestionsAnswers input={questionsAnswers} />
        <Title title='Contact Us' />
        <p className='mx-10 text-xl leading-loose text-gray-700 dark:text-gray-200 sm:mx-28 lg:mx-60'>
          {' '}
          If you have any questions or concerns, please reach out to us
        </p>
        <div className='m-2 flex justify-center'>
          <a href='https://www.github.com/terror/mcgill.courses'>
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
      </div>{' '}
    </Layout>
  );
};
