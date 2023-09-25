import { useEffect, useState } from 'react';
import { User } from 'react-feather';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

import { CourseReview } from '../components/CourseReview';
import { JumpToTopButton } from '../components/JumpToTopButton';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { fetchClient } from '../lib/fetchClient';
import { courseIdToUrlParam } from '../lib/utils';
import { Review } from '../model/Review';

export const Profile = () => {
  const user = useAuth();

  const [darkMode] = useDarkMode();
  const [userReviews, setUserReviews] = useState<Review[]>();

  useEffect(() => {
    fetchClient
      .getData<Review[]>(`/reviews?user_id=${user?.id}`)
      .then((data) => setUserReviews(data))
      .catch(() =>
        toast.error(
          'An error occurred while fetching your reviews, please try again later.'
        )
      );
  }, [user?.id]);

  return (
    <Layout>
      <JumpToTopButton />
      <div className='flex w-full justify-center'>
        <div className='mx-4 flex w-full flex-row rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mt-10'>
          <div className='flex w-fit flex-col space-y-3 md:m-4'>
            <User
              size={100}
              className={twMerge(
                '-ml-3',
                darkMode ? 'text-white' : 'text-gray-700'
              )}
            />
            <h1 className='font-semibold text-gray-800 dark:text-gray-200 md:text-2xl'>
              {user?.mail}
            </h1>
            <p className='font-semibold text-gray-800 dark:text-gray-200'>
              {userReviews?.length} review(s)
            </p>
          </div>
        </div>
      </div>
      <div className='m-4'>
        {userReviews === undefined ? (
          <div className='mt-2 text-center'>
            <Spinner />
          </div>
        ) : userReviews.length ? (
          userReviews
            .sort(
              (a, b) =>
                parseInt(a.timestamp.$date.$numberLong, 10) -
                parseInt(b.timestamp.$date.$numberLong, 10)
            )
            .map((review, i) => {
              return (
                <div key={i}>
                  <div className='flex'>
                    <h2 className='flex-auto text-2xl font-bold text-gray-700 dark:text-gray-200'>
                      {review.courseId}
                    </h2>
                    <Link
                      to={`/course/${courseIdToUrlParam(review.courseId)}`}
                      className='flex-auto text-right text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50'
                    >
                      View Course
                    </Link>
                  </div>
                  <div className='my-4 rounded-lg border-gray-800 duration-300 ease-in-out'>
                    <CourseReview
                      canModify={false}
                      handleDelete={() => null}
                      openEditReview={() => null}
                      review={review}
                    />
                  </div>
                </div>
              );
            })
        ) : null}
      </div>
    </Layout>
  );
};
