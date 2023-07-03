import { ExternalLink } from 'react-feather';

import { Course } from '../model/Course';
import { CourseTerms } from './CourseTerms';
import { RatingInfo } from './RatingInfo';

const Charts = ({
  numReviews,
  rating,
  difficulty,
}: {
  numReviews?: number;
  rating: number;
  difficulty: number;
}) => {
  if (numReviews === undefined) return null;

  return numReviews ? (
    <>
      <RatingInfo title={'Rating'} rating={rating} />
      <RatingInfo title={'Difficulty'} rating={difficulty} />
    </>
  ) : (
    <div className='w-[50%] text-left text-gray-700 dark:text-gray-200 md:text-center'>
      No reviews have been left for this course yet. Be the first!
    </div>
  );
};

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
    <div className='flex w-full flex-row rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mt-10'>
      <div className='m-4 space-y-3 md:m-4 md:w-1/2'>
        <div className='flex flex-row space-x-2 align-middle'>
          <h1 className='text-4xl font-semibold text-gray-800 dark:text-gray-200'>
            {course._id}
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
        <h2 className='text-3xl text-gray-800 dark:text-gray-200'>
          {course.title}
        </h2>
        <div className='m-4 mx-auto flex w-fit flex-col items-center justify-center space-y-3 md:hidden'>
          <Charts
            numReviews={numReviews}
            rating={rating}
            difficulty={difficulty}
          />
        </div>
        <CourseTerms course={course} variant='large' />
        <p className='break-words text-gray-500 dark:text-gray-400'>
          {course.description}
        </p>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          {numReviews} reviews
        </p>
      </div>
      <div className='m-4 mx-auto hidden w-fit flex-col items-center justify-center space-y-3 md:m-4 md:flex md:w-1/2 lg:flex-row'>
        <Charts
          numReviews={numReviews}
          rating={rating}
          difficulty={difficulty}
        />
      </div>
    </div>
  );
};
