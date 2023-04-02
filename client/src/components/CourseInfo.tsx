import { useState } from 'react';
import { ExternalLink } from 'react-feather';
import { BsSnow, BsSun } from 'react-icons/bs';
import { FaCanadianMapleLeaf } from 'react-icons/fa';

import { Course } from '../model/course';

const LinkButton = ({ url }: { url: string }) => {
  const [color, setColor] = useState('Gray');
  const red = 'rgb(220 38 38)';

  return (
    <a href={url} className='my-auto'>
      <ExternalLink
        size={20}
        className='ml-1'
        color={color}
        onMouseEnter={() => setColor(red)}
        onMouseLeave={() => setColor('Gray')}
      ></ExternalLink>
    </a>
  );
};

const TermsIcons = ({ terms }: { terms: string[] }) => {
  type IconMap = { [key: string]: JSX.Element };

  const icons: IconMap = {
    fall: <FaCanadianMapleLeaf size={25} color='Brown' />,
    winter: <BsSnow size={25} color='SkyBlue' />,
    summer: <BsSun size={25} color='Orange' />,
  };

  return (
    <div className='flex flex-row space-x-3'>
      {terms
        .map((term) => term.split(' ')[0].toLowerCase())
        .map((term) => icons[term])}
    </div>
  );
};

export const CourseInfo = ({ course }: { course: Course }) => {
  return (
    <div className='w-screen p-6 bg-slate-50 md:mt-10'>
      <div className='flex flex-col md:flex-row'>
        <div className='flex flex-col space-y-3 w-fit m-4 md:w-1/2 md:m-4'>
          <div className='flex flex-row space-x-2 align-middle'>
            <h1 className='text-4xl font-semibold break-words text-gray-800'>
              {course._id}
            </h1>
            {course.url ? <LinkButton url={course.url} /> : null}
          </div>
          <h2 className='text-3xl text-gray-800'> {course.title} </h2>
          {course.terms.length > 0 ? (
            <TermsIcons terms={course.terms} />
          ) : (
            <p>This course is not currently being offered.</p>
          )}
          <p className='text-gray-500 break-words'>{course.description}</p>
        </div>
        <div className='flex flex-col space-y-3 w-fit m-4  md:m-4 md:w-1/2'></div>
      </div>
    </div>
  );
};
