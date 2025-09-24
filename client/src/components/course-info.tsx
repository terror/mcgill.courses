import { Bell, BellOff, ExternalLink } from 'lucide-react';

import {
  useAddSubscription,
  useRemoveSubscription,
  useSubscription,
} from '../hooks/api';
import { useAuth } from '../hooks/use-auth';
import { parseCourseDescription } from '../lib/dom-utils';
import type { Review } from '../lib/types';
import type { Course } from '../model/course';
import { CourseInfoStats } from './course-info-stats';
import { CourseTerms } from './course-terms';

type CourseInfoProps = {
  course: Course;
  allReviews: Review[];
  numReviews?: number;
};

export const CourseInfo = ({ course, allReviews }: CourseInfoProps) => {
  const user = useAuth();

  const { data: subscriptionData } = useSubscription(course._id);

  const addSubscriptionMutation = useAddSubscription();
  const removeSubscriptionMutation = useRemoveSubscription();

  const isSubscribed = subscriptionData !== null;

  return (
    <div className='relative flex w-full flex-row rounded-md bg-slate-50 px-6 pt-8 shadow-sm dark:bg-neutral-800 md:mt-10'>
      <div className='flex w-full flex-col md:w-7/12'>
        <div className='flex flex-row space-x-2 align-middle'>
          <div className='flex items-center space-x-2'>
            <h1 className='text-3xl font-semibold text-gray-800 dark:text-gray-200'>
              {course.subject} {course.code}
            </h1>
            <div className='flex h-6 items-center rounded-full bg-slate-200 px-2 text-xs font-medium dark:bg-neutral-700 dark:text-gray-300 '>
              {course.credits} {course.credits === '1' ? 'Credit' : 'Credits'}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {user &&
              (isSubscribed ? (
                <BellOff
                  size={20}
                  onClick={async () =>
                    removeSubscriptionMutation.mutate(course._id)
                  }
                  className='my-auto ml-1 cursor-pointer transition-colors duration-300 hover:stroke-red-600 dark:text-gray-200'
                />
              ) : (
                <Bell
                  size={20}
                  onClick={async () =>
                    addSubscriptionMutation.mutate(course._id)
                  }
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
          {parseCourseDescription(course.description)}
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
      <div className='hidden w-5/12 justify-center rounded-md bg-neutral-50 py-4 dark:bg-neutral-800 md:mx-5 md:flex lg:ml-12 lg:mt-6 xl:justify-start'>
        <CourseInfoStats
          variant='large'
          allReviews={allReviews}
          className='lg:mr-8'
        />
      </div>
    </div>
  );
};
