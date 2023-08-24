import { ExternalLink } from 'react-feather';

import { Course } from '../model/Course';
import { CourseInfoStats } from './CourseInfoStats';
import { CourseTerms } from './CourseTerms';

type CourseInfoProps = {
  course: Course;
  rating: number;
  difficulty: number;
  numReviews?: number;
};

export const CourseInfo = ({
  course,
  rating,
  difficulty,
  numReviews,
}: CourseInfoProps) => {
  return (
    <div className='flex w-full flex-row rounded-md bg-slate-50 px-6 py-2 dark:bg-neutral-800 md:mt-10'>
      <div className='md:w-full'>
        <div className='flex flex-row space-x-2 align-middle'>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-gray-200'>
            {course.subject} {course.code}
          </h1>
          {course.url ? (
            <a
              href={course.url}
              className='my-auto dark:text-gray-200'
              target='_blank'
            >
              <ExternalLink
                size={20}
                className='ml-1 transition-colors duration-300 hover:stroke-red-600'
              />
            </a>
          ) : null}
        </div>
        <div className='py-1' />
        <h2 className='text-2xl text-gray-800 dark:text-gray-200'>
          {course.title}
        </h2>
        <CourseTerms course={course} variant='large' />
        <div className='py-1' />
        <p className='break-words text-gray-500 dark:text-gray-400'>
          {course.description}
        </p>
        <div className='py-3' />
        <CourseInfoStats rating={rating} difficulty={difficulty} />
        <div className='py-1' />
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          {numReviews} reviews
        </p>
      </div>
    </div>
  );
};
