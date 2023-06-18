import { ExternalLink } from 'react-feather';
import { useState } from 'react';
import { Course } from '../model/Course';
import { CourseTerms } from './CourseTerms';
import { RatingInfo } from './RatingInfo';
import { Review } from '../model/Review';
import { countRatings } from '../lib/utils';
import { Toggle } from './Toggle';
import _ from 'lodash';

export type map = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

type ChartsProps = {
  numReviews?: number;
  rating: number;
  difficulty: number;
};

const Charts = ({ numReviews, rating, difficulty }: ChartsProps) => {
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
  reviews: Review[];
};

export const CourseInfo = ({ course, reviews }: CourseInfoProps) => {
  const ratingMap: map = countRatings('rating', reviews);
  const difficultyMap: map = countRatings('difficulty', reviews);
  const numReviews = reviews.length;

  const [chartType, setChartType] = useState<'pie' | 'histogram'>('pie');

  return (
    <div className='flex justify-center'>
      <div className='mx-8 flex w-screen flex-row rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mt-10'>
        <div className='flex flex-1 flex-col md:flex-row'>
          <div className='m-4 flex w-fit flex-col space-y-3 md:m-4 md:w-1/2'>
            <div className='flex flex-row space-x-2 align-middle'>
              <h1 className='break-words text-4xl font-semibold text-gray-800 dark:text-gray-200'>
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
            <div className='px- m-4 mx-auto flex w-full flex-col items-center justify-center space-y-3 md:hidden'>
              <RatingInfo
                title={'Rating'}
                chartType={chartType}
                ratings={ratingMap}
                numReviews={numReviews}
              />
              <RatingInfo
                title={'Difficulty'}
                chartType={chartType}
                ratings={difficultyMap}
                numReviews={numReviews}
              />
            </div>
            <div className='mx-auto md:hidden'>
              <Toggle
                onToggle={() =>
                  chartType === 'pie'
                    ? setChartType('histogram')
                    : setChartType('pie')
                }
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
          <div className='mx-auto my-auto flex w-1/2 flex-col'>
            <div className='m-4 mx-auto hidden w-full flex-col items-center justify-center space-y-5 md:m-4 md:flex lg:flex-row lg:space-x-5 lg:space-y-0'>
              <RatingInfo
                title={'Rating'}
                chartType={chartType}
                ratings={ratingMap}
                numReviews={numReviews}
              />
              <RatingInfo
                chartType={chartType}
                title={'Difficulty'}
                ratings={difficultyMap}
                numReviews={numReviews}
              />
            </div>
            <div className='mx-auto hidden md:flex'>
              <Toggle
                onToggle={() =>
                  chartType === 'pie'
                    ? setChartType('histogram')
                    : setChartType('pie')
                }
              />
            </div>
          </div>
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
