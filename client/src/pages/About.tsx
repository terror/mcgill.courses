import { Disclosure } from '@headlessui/react';
import { AiOutlineGithub } from 'react-icons/ai';
import { FiMail } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';
import { Link } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { Paragraph } from '../components/Paragraph';

type QuestionAnswer = {
  title: string;
  content: React.ReactNode;
};

type QuestionsAnswersProps = {
  input: QuestionAnswer[];
};

const QuestionsAnswers = ({ input }: QuestionsAnswersProps) => {
  return (
    <div className='flex min-w-full max-w-md flex-col items-center space-y-3 dark:bg-neutral-900'>
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

type TitleProps = {
  children: React.ReactNode;
};

const Title = ({ children }: TitleProps) => {
  return (
    <div className='mb-3 mt-10 md:mb-5'>
      <h1 className='mb-auto text-2xl font-bold text-gray-700 dark:text-gray-200 md:text-3xl'>
        {children}
      </h1>
    </div>
  );
};

type PersonLink = {
  title: string;
  url: string;
};

const Person = ({
  name,
  imageUrl,
  links,
}: {
  name: string;
  imageUrl: string;
  links?: PersonLink[];
}) => {
  return (
    <li className='mt-6 flex items-center gap-x-4'>
      <img className='w-[100px] rounded-full' src={imageUrl} />
      <div className='flex-row'>
        <Paragraph>{name}</Paragraph>
        <div className='flex gap-x-2'>
          {links?.map((link: PersonLink, i) => (
            <>
              <a key={i} target='_blank' href={link.url}>
                <Paragraph className='underline'>{link.title}</Paragraph>
              </a>
              {i !== links.length - 1 && <Paragraph>•</Paragraph>}
            </>
          ))}
        </div>
      </div>
    </li>
  );
};

const questions = [
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

const people = [
  {
    name: "Liam Scalzulli (CS '2025)",
    imageUrl: 'https://avatars.githubusercontent.com/u/31192478?v=4',
    links: [
      { title: 'Github', url: 'https://github.com/terror' },
      {
        title: 'Linkedin',
        url: 'https://www.linkedin.com/in/liamscalzulli/',
      },
    ],
  },
  {
    name: "Jeff Zhang (Hons CS '2025)",
    imageUrl: 'https://avatars.githubusercontent.com/u/47371088?v=4',
    links: [{ title: 'Github', url: 'https://github.com/jeffdotpng' }],
  },
  {
    name: "Sam Zhang (CS & Stats '2025)",
    imageUrl: 'https://avatars.githubusercontent.com/u/112342947?v=4',
    links: [
      { title: 'Github', url: 'https://github.com/samzhang02' },
      {
        title: 'Linkedin',
        url: 'https://www.linkedin.com/in/zhang-sam/',
      },
    ],
  },
  {
    name: "Joey Yu (CS '2025)",
    imageUrl: 'https://avatars.githubusercontent.com/u/25695219?v=4',
    links: [{ title: 'Github', url: 'https://github.com/itsjoeoui' }],
  },
];

export const About = () => {
  return (
    <Layout>
      <div className='m-auto mb-10 flex max-w-[800px] flex-col px-2 sm:px-8 md:px-16'>
        <Title>Welcome to mcgill.courses!</Title>
        <Paragraph className='leading-loose text-gray-700 dark:text-gray-200'>
          <Link className='underline' to='/'>
            mcgill.courses
          </Link>{' '}
          is an open-sourced, student-made review website for courses offered
          and instructors teaching at McGill University. Our platform aims to
          provide transparent and accurate information to help with informed
          decision-making. We encourage contributions from the McGill community
          to ensure the resource remains valuable.
        </Paragraph>
        <Title>History & The Team</Title>
        <Paragraph>
          <Link className='underline' to='/'>
            mcgill.courses
          </Link>{' '}
          started off as a side-project back in{' '}
          <a
            className='underline'
            href='https://github.com/terror/mcgill.courses/commit/45268b4e39801a4d9531d7b8ad5654fcca5bb01d'
            target='_blank'
          >
            March 2023
          </a>{' '}
          after a few of us realized there was no single dedicated site centered
          around the McGill course search and discovery experience. Since then
          it has grown into a full-fledged platform with a team of dedicated
          developers and designers.
        </Paragraph>
        {people.map((person) => (
          <Person {...person} />
        ))}
        <Title>FAQ</Title>
        <QuestionsAnswers input={questions} />
        <Title>Contact Us</Title>
        <Paragraph>
          If you have any questions or concerns, please don't hesitate to reach
          out to us, either by submitting an issue or pull request on our Github
          repository, or directly by email.
        </Paragraph>
        <div className='mt-6 flex gap-x-2'>
          <a
            target='_blank'
            href='https://www.github.com/terror/mcgill.courses'
          >
            <AiOutlineGithub
              className='text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
              size={40}
            />
          </a>
          <a href='mailto:'>
            <FiMail
              className='text-gray-500 transition-colors duration-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
              size={40}
            />
          </a>
        </div>
      </div>
    </Layout>
  );
};
