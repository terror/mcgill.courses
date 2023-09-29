import { Link } from 'react-router-dom';

import { courseIdToUrlParam } from '../lib/utils';
import { Course } from '../model/Course';
import { CourseTerms } from './CourseTerms';
import { Highlight } from './Highlight';

type CourseCardProps = {
  course: Course;
  className: string;
  query?: string;
};

export const CourseCard = ({ course, className, query }: CourseCardProps) => {
  return (
    <Link
      to={`/course/${courseIdToUrlParam(course._id)}`}
      key={course._id}
      className={className}
    >
      <div className='max-w-xl rounded-lg bg-slate-50 p-5 duration-150 hover:bg-gray-50 dark:bg-neutral-800'>
        <div className='mb-2 font-bold dark:text-gray-200'>
          {query ? (
            <Highlight text={`${course._id} - ${course.title}`} query={query} />
          ) : (
            `${course._id} - ${course.title}`
          )}
        </div>
        <CourseTerms course={course} variant='small' />
        <div className='mt-2 text-gray-600 dark:text-gray-400'>
          {query ? (
            <Highlight text={course.description} query={query} />
          ) : (
            course.description
          )}
        </div>
      </div>
    </Link>
  );
};
