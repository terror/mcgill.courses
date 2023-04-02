import { useState } from 'react';
import { ExternalLink } from 'react-feather';

import { Course } from '../model/course';

export const LinkButton = ({ url }: { url: string }) => {
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

export const CourseInfo = ({ course }: { course: Course }) => {
  return (
    <div className='w-screen p-6 bg-slate-50 md:mt-10'>
      <div className='flex flex-col md:flex-row'>
        <div className='flex flex-col space-y-3 w-fit m-4 md:w-1/2 md:m-4'>
          <div className='flex flex-row space-x-2 align-middle'>
            <h1 className='text-3xl font-semibold break-words text-gray-700'>
              {course._id}
            </h1>
            {course.url ? <LinkButton url={course.url} /> : null}
          </div>
          <h2 className='text-2xl'> {course.title} </h2>

          {/* Make nice UI for this*/}
          {course.terms.length > 0 ? (
            <p className='text-gray-500'>{course.terms.join(', ')}</p>
          ) : (
            <p> Not currently offered </p>
          )}
          <p className='text-gray-500'>
            {course.faculty} ({course.department})
          </p>

          <p className='text-gray-500 break-words'>{course.description}</p>
        </div>
        <div className='flex flex-col space-y-3 w-fit m-4  md:m-4 md:w-1/2'></div>
      </div>
    </div>
  );
};
