import { Disclosure } from '@headlessui/react';
import { AiOutlineGithub } from 'react-icons/ai';
import { FiMail } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { Link } from 'react-router-dom';

import { Layout } from '../components/Layout';

type QuestionAnswer = {
  title: string;
  content: JSX.Element | string;
};

type QuestionsAnswersProps = {
  input: QuestionAnswer[];
};

const QuestionsAnswers = ({ input }: QuestionsAnswersProps) => {
  return (
    <div className='flex min-w-full max-w-md flex-col items-center justify-center space-y-3 p-2 dark:bg-neutral-900'>
      {input.map((item: QuestionAnswer) => (
        <Disclosure as='div' key={item.title} className='w-full'>
          {({ open }) => (
            <>
              <Disclosure.Button className='mx-auto flex w-full justify-between rounded-lg bg-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-black/75 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-600'>
                <span>{item.title}</span>
                <IoIosArrowDown
                  className={`${
                    open ? 'rotate-180' : ''
                  } h-5 w-5 text-gray-900 dark:text-gray-300`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className='px-4 pb-2 pt-4 text-sm text-gray-700 dark:text-gray-200'>
                {item.content}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
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
          cloudberry.fyi
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

type TitleProps = {
  children: string;
};

const Title = ({ children }: TitleProps) => {
  return (
    <div className='mb-5 mt-10'>
      <h1 className='mb-auto text-4xl font-bold text-gray-700 dark:text-gray-200'>
        {children}
      </h1>
    </div>
  );
};

export const About = () => {
  return (
    <Layout>
      <div className='mx-4 my-auto mb-10 flex flex-col justify-center text-center align-middle '>
        <Title>About Us</Title>
        <p className='text-xl leading-loose text-gray-700 dark:text-gray-200 md:mx-16 lg:mx-40'>
          mcgill.courses is an open-sourced, student-made review website for
          courses offered and instructors teaching at McGill University. Our
          platform aims to provide transparent and accurate information to help
          with informed decision-making. We encourage contributions from the
          McGill community to ensure the resource remains valuable.
        </p>
        <Title>FAQ</Title>
        <div className='px-4 md:mx-16 lg:mx-28 xl:mx-48'>
          <QuestionsAnswers input={questionsAnswers} />
        </div>
        <Title>Contact Us</Title>
        <p className='text-xl leading-loose text-gray-700 dark:text-gray-200 sm:mx-28 lg:mx-60 xl:mx-80'>
          If you have any questions or concerns, please don't hesitate to reach
          out to us!
        </p>
        <div className='m-2 flex justify-center'>
          <a href='https://www.github.com/terror/mcgill.courses'>
            <AiOutlineGithub
              className='mx-2 text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
              size={40}
            />
          </a>
          <a href='mailto:'>
            <FiMail
              className='mx-2 text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
              size={40}
            />
          </a>
        </div>
      </div>
    </Layout>
  );
};
