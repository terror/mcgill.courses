import _ from 'lodash';
import { ExternalLink } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

import { CourseInfoStats } from '../components/course-info-stats';
import { CourseReview } from '../components/course-review';
import { Layout } from '../components/layout';
import { ReviewEmptyPrompt } from '../components/review-empty-prompt';
import { useInstructor } from '../hooks/api';
import { useAuth } from '../hooks/use-auth';
import { courseIdToUrlParam } from '../lib/utils';
import { Loading } from './loading';
import { NotFound } from './not-found';

export const Instructor = () => {
  const params = useParams<{ name: string }>();

  const [showAllReviews, setShowAllReviews] = useState(false);

  const user = useAuth();

  const {
    data: instructorData,
    isLoading,
    error,
  } = useInstructor(params.name || '');

  if (isLoading) return <Loading />;

  if (error || !instructorData?.instructor) return <NotFound />;

  const instructor = instructorData.instructor;
  const reviews = instructorData.reviews;

  const userReview = reviews.find((r) => r.userId === user?.id);
  const uniqueReviews = _.uniqBy(reviews, (r) => r.courseId);

  return (
    <Layout>
      <Helmet>
        <title>{instructor.name} - mcgill.courses</title>

        <meta property='og:type' content='website' />
        <meta property='og:url' content={`https://mcgill.courses/explore`} />
        <meta
          property='og:title'
          content={`${instructor.name}- mcgill.courses`}
        />

        <meta
          property='twitter:url'
          content={`https://mcgill.courses/explore`}
        />
        <meta
          property='twitter:title'
          content={`${instructor.name}- mcgill.courses`}
        />
      </Helmet>

      <div className='mx-auto mt-10 flex max-w-5xl overflow-hidden md:mt-0'>
        <div className='flex w-screen flex-row rounded-md bg-slate-50 p-2 dark:bg-neutral-800 md:mt-10'>
          <div className='flex flex-1 flex-col md:flex-row'>
            <div className='flex w-fit flex-col p-4 md:w-1/2'>
              <div className='flex flex-row items-center space-x-2 align-middle'>
                <h1 className='break-words text-4xl font-semibold text-gray-800 dark:text-gray-200'>
                  {params.name && decodeURIComponent(params.name)}
                </h1>
                <a
                  href={`https://www.mcgill.ca/search/?query=${params.name && encodeURIComponent(params.name)}`}
                  className='my-auto dark:text-gray-200'
                  target='_blank'
                >
                  <ExternalLink
                    size={20}
                    className='ml-1 transition-colors duration-300 hover:stroke-red-600'
                  />
                </a>
              </div>
              <p className='mt-4 text-gray-500 dark:text-gray-400'>
                {uniqueReviews.length ? (
                  <div>
                    <div>Teaches or has taught the following course(s): </div>
                    <div className='max-w-sm'>
                      {uniqueReviews.map((review, index) => (
                        <Fragment key={index}>
                          <Link
                            to={`/course/${courseIdToUrlParam(
                              review.courseId
                            )}`}
                            className='font-medium transition hover:text-red-600'
                          >
                            {review.courseId}
                          </Link>
                          {index !== uniqueReviews.length - 1 ? ', ' : '.'}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                ) : (
                  "This professor hasn't taught any courses that have been reviewed yet."
                )}
              </p>
              {reviews.length !== 0 && (
                <Fragment>
                  <div className='grow py-3' />
                  <CourseInfoStats className='md:hidden' reviews={reviews} />
                  <p className='mt-4 text-sm text-gray-500 dark:text-gray-400'>
                    {reviews.length} review(s)
                  </p>
                </Fragment>
              )}
            </div>
            <div className='ml-10 hidden w-5/12 justify-center rounded-md bg-neutral-50 py-6 dark:bg-neutral-800 md:flex lg:mt-6'>
              <CourseInfoStats variant='large' reviews={reviews} />
            </div>
          </div>
        </div>
      </div>
      <div className='mx-auto mt-4 max-w-5xl'>
        <div>
          {userReview && (
            <CourseReview
              canModify={false}
              handleDelete={() => undefined}
              includeTaughtBy={false}
              openEditReview={() => undefined}
              review={userReview}
            />
          )}
          {reviews &&
            reviews
              .filter((review) => (user ? review.userId !== user.id : true))
              .slice(0, showAllReviews ? reviews.length : 8)
              .map((review, i) => (
                <CourseReview
                  canModify={false}
                  handleDelete={() => undefined}
                  includeTaughtBy={false}
                  key={i}
                  openEditReview={() => undefined}
                  review={review}
                />
              ))}
        </div>
        {!showAllReviews && reviews.length > 8 && (
          <div className='flex justify-center text-gray-400 dark:text-neutral-500'>
            <button
              className='size-full border border-dashed border-neutral-400 py-2 dark:border-neutral-500'
              onClick={() => setShowAllReviews(true)}
            >
              Show all {reviews.length} reviews
            </button>
          </div>
        )}
        {reviews.length === 0 && (
          <ReviewEmptyPrompt className='my-8'>
            No reviews have been left for this instructor yet, be the first!
          </ReviewEmptyPrompt>
        )}
      </div>
    </Layout>
  );
};
