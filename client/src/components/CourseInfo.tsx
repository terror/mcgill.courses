import { ExternalLink } from 'react-feather';
import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';

import { Course } from '../model/Course';
import { CourseTerms } from './CourseTerms';
import { RatingInfo } from './RatingInfo';
import { FiBell, FiBellOff } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { Subscription } from '../model/Subscription';

type ChartsProps = {
  numReviews?: number;
  rating: number;
  difficulty: number;
};

const Charts = ({ numReviews, rating, difficulty }: ChartsProps) => {
  if (numReviews === undefined) return null;

  return numReviews ? (
    <div className='flex-row md:flex'>
      <RatingInfo title={'Rating'} rating={rating} />
      <RatingInfo title={'Difficulty'} rating={difficulty} />
    </div>
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
  const user = useAuth();

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkSubscription = async () => {
      try {
        const subscription = await fetchClient.getData<Subscription | null>(
          `/subscriptions?course_id=${course._id}`,
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        console.log(subscription);
        setIsSubscribed(subscription !== null);
      } catch (err) {
        console.error(err);
      }
    };

    checkSubscription();
  }, []);

  const subscribe = async () => {
    if (!user) return;

    try {
      await fetchClient.post(
        '/subscriptions',
        { course_id: course._id },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setIsSubscribed(true);
    } catch (err) {
      console.error(err);
    }
  };

  const unsubscribe = async () => {
    if (!user) return;

    try {
      await fetchClient.delete(
        '/subscriptions',
        { course_id: course._id },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setIsSubscribed(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='flex w-full flex-row rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mt-10'>
      <div className='m-4 space-y-3 md:m-4 md:w-1/2'>
        <div className='flex flex-row space-x-2 align-middle'>
          <h1 className='text-4xl font-semibold text-gray-800 dark:text-gray-200'>
            {course.subject} {course.code}
          </h1>
          <div className='flex items-center gap-2'>
            {user &&
              (isSubscribed ? (
                <FiBellOff
                  size={20}
                  onClick={unsubscribe}
                  className='my-auto ml-1 cursor-pointer transition-colors duration-300 hover:stroke-red-600 dark:text-gray-200'
                />
              ) : (
                <FiBell
                  size={20}
                  onClick={subscribe}
                  className='my-auto ml-1 cursor-pointer transition-colors duration-300 hover:stroke-red-600 dark:text-gray-200'
                />
              ))}
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
          {numReviews} review(s)
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
