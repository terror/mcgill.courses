import { useEffect, useState } from 'react';

import { CourseReview } from '../components/CourseReview';
import { JumpToTopButton } from '../components/JumpToTopButton';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Review } from '../model/Review';
import { User } from 'react-feather';
import { useDarkMode } from '../hooks/useDarkMode';
import { twMerge } from 'tailwind-merge';

export const Profile = () => {
  const user = useAuth();

  const [darkMode] = useDarkMode();
  const [userReviews, setUserReviews] = useState<Review[]>();

  useEffect(() => {
    fetchClient
      .getData<Review[]>(`/reviews?user_id=${user?.id}`)
      .then((data) => setUserReviews(data))
      .catch((err) => console.log(err));
  }, [user?.id]);

  return (
    <Layout>
      <JumpToTopButton />
      <div className='flex justify-center'>
        <div className='mx-4 flex w-screen flex-row rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mt-10'>
          <div className='m-4 flex w-fit flex-col space-y-3'>
            <User
              size={100}
              className={twMerge(
                '-ml-3',
                darkMode ? 'text-white' : 'text-gray-700'
              )}
            />
            <h1 className='text-md font-semibold text-gray-800 dark:text-gray-200 md:text-2xl'>
              {user?.mail}
            </h1>
            <p className='font-semibold text-gray-800 dark:text-gray-200'>
              {userReviews?.length} review(s)
            </p>
          </div>
        </div>
      </div>
      <div className='flex w-full flex-row justify-between'>
        <div className='mx-4 my-4 w-full md:mt-4'>
          <div className='w-full'>
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
                      <CourseReview
                        canModify={false}
                        handleDelete={() => null}
                        isLast={i === userReviews.length - 1}
                        openEditReview={() => null}
                        review={review}
                      />
                    </div>
                  );
                })
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
};
