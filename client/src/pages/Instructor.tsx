import _ from 'lodash';
import { CourseInfoStats } from '../components/CourseInfoStats';
import { CourseReview } from '../components/CourseReview';
import { Fragment, useEffect, useState } from 'react';
import { GetInstructorPayload } from '../model/GetInstructorPayload';
import { Instructor as InstructorType } from '../model/Instructor';
import { Layout } from '../components/Layout';
import { Link, useParams } from 'react-router-dom';
import { Loading } from './Loading';
import { NotFound } from './NotFound';
import { Review } from '../model/Review';
import { courseIdToUrlParam } from '../lib/utils';
import { fetchClient } from '../lib/fetchClient';
import { useAuth } from '../hooks/useAuth';
import { ExternalLink } from 'react-feather';

export const Instructor = () => {
  const params = useParams<{ name: string }>();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [instructor, setInstructor] = useState<
    InstructorType | undefined | null
  >(undefined);

  const user = useAuth();

  useEffect(() => {
    if (params.name) {
      fetchClient
        .getData<GetInstructorPayload>(
          `/instructors/${decodeURIComponent(params.name)}`
        )
        .then((payload) => {
          setInstructor(payload.instructor);
          setReviews(payload.reviews);
        });
    }
  }, [params.name]);

  if (instructor === undefined) return <Loading />;
  if (instructor === null) return <NotFound />;

  const userReview = reviews.find((r) => r.userId === user?.id),
    uniqueReviews = _.uniqBy(reviews, (r) => r.courseId);

  return (
    <Layout>
      <div className='mx-auto flex max-w-6xl'>
        <div className='flex w-screen flex-row rounded-md bg-slate-50 p-2 dark:bg-neutral-800 md:mt-10'>
          <div className='flex flex-1 flex-col md:flex-row'>
            <div className='m-4 flex w-fit flex-col md:m-4 md:w-1/2'>
              <div className='flex flex-row items-center space-x-2 align-middle'>
                <h1 className='break-words text-4xl font-semibold text-gray-800 dark:text-gray-200'>
                  {params.name && decodeURIComponent(params.name)}
                </h1>
                <a
                  href={`https://www.mcgill.ca/search/${params.name}`}
                  className='my-auto dark:text-gray-200'
                  target='_blank'
                >
                  <ExternalLink
                    size={20}
                    className='ml-1 transition-colors duration-300 hover:stroke-red-600'
                  />
                </a>
              </div>
              <p className='mt-2 text-gray-500 dark:text-gray-400'>
                {uniqueReviews.length ? (
                  <Fragment>
                    Teaches or has taught the following course(s):{' '}
                    {uniqueReviews.map((review, index) => (
                      <Fragment key={index}>
                        <Link
                          to={`/course/${courseIdToUrlParam(review.courseId)}`}
                          className='font-medium transition hover:text-red-600'
                        >
                          {review.courseId}
                        </Link>
                        {index !== uniqueReviews.length - 1 ? ', ' : '.'}
                      </Fragment>
                    ))}
                  </Fragment>
                ) : (
                  "This professor hasn't taught any courses that have been reviewed yet."
                )}
              </p>
              <div className='grow py-3' />
              {uniqueReviews.length && (
                <CourseInfoStats
                  className='md:hidden'
                  allReviews={uniqueReviews}
                />
              )}
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {uniqueReviews.length} review(s)
              </p>
            </div>
            <div className='hidden w-5/12 justify-center rounded-md bg-neutral-50 py-4 dark:bg-neutral-800 md:flex lg:ml-12 lg:mt-6 xl:justify-start'>
              <CourseInfoStats
                variant='large'
                allReviews={uniqueReviews}
                className='lg:mr-8'
              />
            </div>
          </div>
        </div>
      </div>
      <div className='mt-4'>
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
              className='h-full w-full border border-dashed border-neutral-400 py-2 dark:border-neutral-500'
              onClick={() => setShowAllReviews(true)}
            >
              Show all {reviews.length} reviews
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};
