import { ExternalLink } from 'react-feather';

import { Course } from '../model/Course';
import { CourseTerms } from './CourseTerms';

export const CourseInfo = ({ course }: { course: Course }) => {
  return (
    <div className='flex justify-center'>
      <div className='w-screen p-6 mx-8 rounded-md bg-slate-50 md:mt-10'>
        <div className='flex flex-col md:flex-row'>
          <div className='flex flex-col space-y-3 w-fit m-4 md:w-1/2 md:m-4'>
            <div className='flex flex-row space-x-2 align-middle'>
              <h1 className='text-4xl font-semibold break-words text-gray-800'>
                {course._id}
              </h1>
              {course.url ? (
                <a href={course.url} className='my-auto' target='_blank'>
                  <ExternalLink
                    size={20}
                    className='ml-1 transition-colors duration-300 hover:stroke-red-500'
                  />
                </a>
              ) : null}
            </div>
            <h2 className='text-3xl text-gray-800'> {course.title} </h2>
            {course.terms.length > 0 ? (
              <CourseTerms course={course} variant='large' />
            ) : (
              <p>This course is not currently being offered.</p>
            )}
            <p className='text-gray-500 break-words'>{course.description}</p>
          </div>
          <div className='flex flex-col space-y-3 w-fit m-4  md:m-4 md:w-1/2'></div>
        </div>
      </div>
    </div>
  );
};
