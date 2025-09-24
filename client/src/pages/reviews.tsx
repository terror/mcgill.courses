import { Helmet } from 'react-helmet-async';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';

import { CourseReview } from '../components/course-review';
import { JumpToTopButton } from '../components/jump-to-top-button';
import { Layout } from '../components/layout';
import { Spinner } from '../components/spinner';
import { useInfiniteReviews } from '../hooks/api';
import { Review } from '../lib/types';
import { courseIdToUrlParam, spliceCourseCode, timeSince } from '../lib/utils';
import { Loading } from './loading';

export const Reviews = () => {
  const limit = 20;

  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    useInfiniteReviews(limit, true);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Layout>
        <div className='mx-auto mt-4 text-center text-red-500'>
          Failed to fetch reviews. Please try again later.
        </div>
      </Layout>
    );
  }

  const reviews = data?.pages.flatMap((page) => page.reviews) || [];

  const uniqueUserCount = data?.pages[0]?.uniqueUserCount;

  return (
    <Layout>
      <Helmet>
        <title>Reviews - mcgill.courses</title>
        <meta
          name='description'
          content='Check out the latest reviews from students of McGill University.'
        />

        <meta property='og:type' content='website' />
        <meta property='og:url' content={`https://mcgill.courses/reviews`} />
        <meta property='og:title' content={`Reviews - mcgill.courses`} />
        <meta
          property='og:description'
          content='Check out the latest reviews from students of McGill University.'
        />

        <meta
          property='twitter:url'
          content={`https://mcgill.courses/reviews`}
        />
        <meta property='twitter:title' content={`Reviews - mcgill.courses`} />
        <meta
          property='twitter:description'
          content='Check out the latest reviews from students of McGill University.'
        />
      </Helmet>

      <div className='flex flex-col items-center py-8'>
        <div className='mb-16'>
          <h1 className='text-center text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-200 sm:text-5xl'>
            What people are saying
          </h1>
          <p className='mt-2 text-center text-gray-600 dark:text-gray-400'>
            Check out what{' '}
            {uniqueUserCount?.toLocaleString('en-us') || 'verified'} verified
            McGill student{uniqueUserCount === 1 ? '' : 's'} on our platform
            {uniqueUserCount === 1 ? ' has' : ' have'} said about courses at
            McGill University.
          </p>
        </div>
        <div className='relative flex w-full max-w-xl flex-col lg:max-w-6xl lg:flex-row lg:justify-center'>
          <InfiniteScroll
            dataLength={reviews.length}
            hasMore={!!hasNextPage}
            loader={
              reviews.length >= 20 &&
              hasNextPage && (
                <div className='mt-4 text-center'>
                  <Spinner />
                </div>
              )
            }
            next={fetchNextPage}
            style={{ overflowY: 'hidden' }}
          >
            <div className='ml-auto flex w-full max-w-xl flex-col lg:max-w-4xl'>
              {reviews.map((review: Review, i: number) => (
                <div
                  key={`${review.courseId}-${review.userId}-${i}`}
                  className='mb-6'
                >
                  <Link
                    to={`/course/${courseIdToUrlParam(review.courseId)}`}
                    className='font-semibold text-gray-800 hover:underline dark:text-gray-200'
                  >
                    {spliceCourseCode(review.courseId, ' ')}
                  </Link>
                  <p className='mb-3 text-xs font-medium text-gray-600 dark:text-gray-400'>
                    {timeSince(parseInt(review.timestamp, 10))}
                  </p>
                  <div>
                    <CourseReview
                      canModify={false}
                      review={review}
                      openEditReview={() => undefined}
                      handleDelete={() => undefined}
                    />
                  </div>
                </div>
              ))}
              {!hasNextPage && reviews.length > 0 ? (
                <div className='mx-[200px] mt-4 text-center'>
                  <p className='text-gray-500 dark:text-gray-400'>
                    No more reviews to show
                  </p>
                </div>
              ) : !hasNextPage && reviews.length === 0 ? (
                <div className='mt-4 text-center'>
                  <p className='text-gray-500 dark:text-gray-400'>
                    No reviews found
                  </p>
                </div>
              ) : null}
            </div>
          </InfiniteScroll>
        </div>
      </div>
      <JumpToTopButton />
    </Layout>
  );
};
