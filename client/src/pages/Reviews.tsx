import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { CourseReview } from '../components/CourseReview';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import { repo } from '../lib/repo';
import { courseIdToUrlParam, spliceCourseCode } from '../lib/utils';
import { Review } from '../model/Review';

export const Reviews = () => {
  const limit = 20;

  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    repo
      .getReviews(undefined, limit, offset)
      .then((data) => setReviews(data))
      .catch(() => {
        toast.error('Failed to fetch reviews. Please try again later.');
      });
    setHasMore(true);
    setOffset(limit);
  }, []);

  const fetchMore = async () => {
    const batch = await repo.getReviews(undefined, limit, offset);

    if (batch.length === 0) setHasMore(false);
    else {
      setReviews(reviews?.concat(batch));
      setOffset(offset + limit);
    }
  };

  return (
    <Layout>
      <div className='flex flex-col items-center py-8'>
        <h1 className='mb-16 text-center text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-200 sm:text-5xl'>
          What people are saying
        </h1>
        <InfiniteScroll
          dataLength={reviews?.length || 0}
          hasMore={hasMore}
          loader={
            (reviews?.length || 0) >= 20 &&
            hasMore && (
              <div className='mt-4 text-center'>
                <Spinner />
              </div>
            )
          }
          next={fetchMore}
          style={{ overflowY: 'hidden' }}
        >
          {reviews.map((review, i) => (
            <div>
              <p className='mb-5 mt-5 font-semibold text-gray-800 dark:text-gray-200'>
                <Link to={`/course/${courseIdToUrlParam(review.courseId)}`}>
                  {spliceCourseCode(review.courseId, ' ')}
                </Link>
              </p>
              <CourseReview
                className='rounded-lg'
                review={review}
                canModify={false}
                handleDelete={() => undefined}
                openEditReview={() => undefined}
                key={i}
              />
            </div>
          ))}
        </InfiniteScroll>
      </div>
    </Layout>
  );
};
