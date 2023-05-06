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
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [editReviewOpen, setEditReviewOpen] = useState(false);

  useEffect(() => {
    fetchClient
      .getData<Review[]>(`/reviews?user_id=${user?.id}`)
      .then((data) => setUserReviews(data))
      .catch((err) => console.log(err));
  }, [user?.id]);

  const handleDelete = async (review: Review) => {
    await fetchClient.delete(
      '/reviews',
      { course_id: review.courseId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    setUserReviews(userReviews.filter((r) => r.courseId !== review.courseId));
  };

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
          <div className='mx-5 flex flex-col flex-wrap rounded-lg border p-4 dark:border-neutral-700'>
            {userReviews &&
              userReviews
                .sort(
                  (a, b) =>
                    parseInt(a.timestamp.$date.$numberLong) -
                    parseInt(b.timestamp.$date.$numberLong)
                )
                .map((r) => {
                  return (
                    <div>
                      <h2 className='text-2xl font-bold text-gray-700 dark:text-gray-200'>
                        {r.courseId}
                      </h2>
                      <Link to={`/course/${r.courseId}`}>
                        <div className='my-4 duration-300 ease-in-out hover:scale-105'>
                          <CourseReview
                            review={r}
                            canModify={false}
                            openEditReview={() => setEditReviewOpen(true)}
                            handleDelete={() => handleDelete(r)}
                          />
                        </div>
                      </Link>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </Layout>
  );
};
