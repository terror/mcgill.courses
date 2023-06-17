import { CourseReview } from '../components/CourseReview';
import { JumpToTopButton } from '../components/JumpToTopButton';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { Review } from '../model/Review';
import { Spinner } from '../components/Spinner';
import { fetchClient } from '../lib/fetchClient';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

export const Profile = () => {
  const user = useAuth();
  const [userReviews, setUserReviews] = useState<Review[]>();

  useEffect(() => {
    fetchClient
      .getData<Review[]>(`/reviews?user_id=${user?.id}`)
      .then((data) => setUserReviews(data))
      .catch((err) => console.log(err));
  }, [user?.id]);

  return (
    <Layout>
      <div className='flex flex-col justify-center'>
        <div className='mx-auto'>
          <div className='mt-10'>
            <h1 className='mb-auto text-center text-4xl font-bold text-gray-700 dark:text-gray-200'>
              Your Reviews
            </h1>
            <hr className='mx-auto my-5 w-32 border-gray-200 text-4xl' />
          </div>
          <div className='py- mx-5 mb-4 flex h-fit max-w-xl flex-col flex-wrap rounded-lg p-4'>
            {userReviews === undefined ? (
              <div className='mx-auto'>
                <Spinner />
              </div>
            ) : userReviews.length === 0 ? (
              <div className='mx-auto'>
                <h2 className='text-2xl font-medium text-gray-400 dark:text-neutral-500'>
                  You have not reviewed any courses yet.
                </h2>
              </div>
            ) : userReviews ? (
              userReviews
                .sort(
                  (a, b) =>
                    parseInt(a.timestamp.$date.$numberLong, 10) -
                    parseInt(b.timestamp.$date.$numberLong, 10)
                )
                .map((review, i) => {
                  return (
                    <div key={i} className='mx-5'>
                      <div className='flex'>
                        <h2 className='flex-auto text-2xl font-bold text-gray-700 dark:text-gray-200'>
                          {review.courseId}
                        </h2>
                        <Link
                          to={`/course/${review.courseId}`}
                          className='flex-auto text-right text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50'
                        >
                          View Course
                        </Link>
                      </div>
                      <div className='my-4 rounded-lg border-gray-800 duration-300 ease-in-out'>
                        <CourseReview
                          canModify={false}
                          handleDelete={() => null}
                          isLast={i === userReviews.length - 1}
                          openEditReview={() => null}
                          review={review}
                        />
                      </div>
                    </div>
                  );
                })
            ) : null}
          </div>
        </div>
      </div>
      <JumpToTopButton />
    </Layout>
  );
};
