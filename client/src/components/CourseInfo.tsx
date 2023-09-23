import { Course } from '../model/Course';
import { CourseInfoStats } from './CourseInfoStats';
import { CourseTerms } from './CourseTerms';
import { ExternalLink } from 'react-feather';
import { FiBell, FiBellOff } from 'react-icons/fi';
import { Review } from '../model/Review';
import { Subscription } from '../model/Subscription';
import { fetchClient } from '../lib/fetchClient';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

type CourseInfoProps = {
  course: Course;
  allReviews: Review[];
  numReviews?: number;
};

export const CourseInfo = ({ course, allReviews }: CourseInfoProps) => {
  const user = useAuth();

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkSubscription = async () => {
      try {
        const subscription = await fetchClient.deserialize<Subscription | null>(
          'GET',
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
      await fetchClient.post('/subscriptions', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: course._id }),
      });
      setIsSubscribed(true);
    } catch (err) {
      console.error(err);
    }
  };

  const unsubscribe = async () => {
    if (!user) return;

    try {
      await fetchClient.delete('/subscriptions', {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: course._id }),
      });
      setIsSubscribed(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='relative flex w-full flex-row rounded-md bg-slate-50 px-6 pt-8 shadow-sm dark:bg-neutral-800 md:mt-10'>
      <div className='flex w-full flex-col md:w-7/12'>
        <div className='flex flex-row space-x-2 align-middle'>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-gray-200'>
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
        <div className='py-1' />
        <h2 className='text-2xl text-gray-800 dark:text-gray-200'>
          {course.title}
        </h2>
        <CourseTerms course={course} variant='large' />
        <div className='py-1' />
        <p className='break-words text-gray-500 dark:text-gray-400'>
          {course.description}
        </p>
        <div className='grow py-3' />
        <CourseInfoStats className='mb-4 sm:hidden' allReviews={allReviews} />
        <CourseInfoStats
          className='hidden gap-x-6 sm:mb-6 sm:flex md:mb-0 md:hidden'
          variant='medium'
          allReviews={allReviews}
        />
        <p className='mb-6 text-sm text-gray-500 dark:text-gray-400'>
          {allReviews.length} review(s)
        </p>
      </div>
      <div className='hidden w-5/12 justify-center rounded-md bg-neutral-50 py-4 dark:bg-neutral-800 md:flex lg:ml-12 lg:mt-6 xl:justify-start'>
        <CourseInfoStats
          variant='large'
          allReviews={allReviews}
          className='lg:mr-8'
        />
      </div>
    </div>
  );
};
