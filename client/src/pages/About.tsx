import { Link } from 'react-router-dom';
import { AiOutlineGithub } from 'react-icons/ai';
import { FiMail } from 'react-icons/fi';

import { Layout } from '../components/Layout';
import { QuestionsAnswers } from '../components/QuestionsAnswers';

const questionsAnswers = [
  {
    title: 'How do we know that the reviews are legitimate?',
    content:
      'Users are required to authenticate with their McGill email address via Microsoft Office 365. This ensures that only McGill students can leave reviews.',
  },
  {
    title: 'When will instructors ratings be available?',
    content:
      'Instructors ratings are a work in progress.It is our current priority and will be available as soon as possible!',
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
