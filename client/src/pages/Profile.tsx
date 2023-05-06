import { Layout } from '../components/Layout';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseReview } from '../components/CourseReview';
import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Review } from '../model/Review';
import { Spinner } from '../components/Spinner';

export const Profile = () => {
  const user = useAuth();
  const [userReviews, setUserReviews] = useState<Review[]>();

  useEffect(() => {
    fetchClient
      .getData<Review[]>(`/reviews?user_id=${user?.id}`)
      .then((data) => setUserReviews(data))
      .catch((err) => console.log(err));
  }, [user?.id]);

  console.log(userReviews);

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
          <div className='mx-5 mb-4 box-border flex h-fit flex-col flex-wrap rounded-lg border p-4 dark:border-neutral-700'>
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
                .map((r) => {
                  return (
                    <div className='mx-5'>
                      <h2 className='flex-auto text-2xl font-bold text-gray-700 dark:text-gray-200'>
                        {r.courseId}
                      </h2>
                      <Link to={`/course/${r.courseId}`}>
                        <div className='my-4 rounded-lg border-gray-800 duration-300 ease-in-out hover:scale-[103%]'>
                          <CourseReview
                            review={r}
                            canModify={false}
                            openEditReview={() => null}
                            handleDelete={() => null}
                          />
                        </div>
                      </Link>
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
