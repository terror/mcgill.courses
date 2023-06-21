import _ from 'lodash';
import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { CourseReview } from '../components/CourseReview';
import { Layout } from '../components/Layout';
import { RatingInfo } from '../components/RatingInfo';
import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Instructor as InstructorType } from '../model/Instructor';
import { Review } from '../model/Review';
import { Loading } from './Loading';
import { NotFound } from './NotFound';

export const Instructor = () => {
  const params = useParams<{ name: string }>();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [instructor, setInstructor] = useState<
    InstructorType | undefined | null
  >(undefined);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const user = useAuth();

  useEffect(() => {
    if (params.name) {
      fetchClient
        .getData<Review[]>(
          `/reviews?instructor_name=${decodeURIComponent(params.name)}`
        )
        .then((data) => {
          setReviews(
            data.sort(
              (a, b) =>
                parseInt(b.timestamp.$date.$numberLong, 10) -
                parseInt(a.timestamp.$date.$numberLong, 10)
            )
          );
        });
      fetchClient
        .getData<InstructorType>(
          `/instructors/${decodeURIComponent(params.name)}`
        )
        .then((data) => {
          setInstructor(data);
        });
    }
  }, [params.name]);

  if (instructor === undefined) return <Loading />;
  if (instructor === null) return <NotFound />;

  const userReview = reviews.find((r) => r.userId === user?.id);
  const uniqueReviews = _.uniqBy(reviews, (r) => r.courseId);
  const averageRating = _.sumBy(reviews, (r) => r.rating) / reviews.length;
  const averageDifficulty =
    _.sumBy(reviews, (r) => r.difficulty) / reviews.length;

  return (
    <Layout>
      <div className='flex justify-center'>
        <div className='mx-8 flex w-screen flex-row rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mt-10'>
          <div className='flex flex-1 flex-col md:flex-row'>
            <div className='m-4 flex w-fit flex-col space-y-3 md:m-4 md:w-1/2'>
              <div className='flex flex-row space-x-2 align-middle'>
                <h1 className='break-words text-4xl font-semibold text-gray-800 dark:text-gray-200'>
                  {params.name && decodeURIComponent(params.name)}
                </h1>
              </div>
              <div className='m-4 mx-auto flex w-fit flex-col items-center justify-center space-y-3 md:hidden'>
                {uniqueReviews.length && (
                  <RatingInfo
                    title='Rating'
                    rating={averageRating}
                    numReviews={reviews.length}
                  />
                )}
                {uniqueReviews.length && (
                  <RatingInfo
                    title='Difficulty'
                    rating={averageDifficulty}
                    numReviews={reviews.length}
                  />
                )}
              </div>
              <p className='text-gray-500 dark:text-gray-400'>
                {uniqueReviews.length ? (
                  <Fragment>
                    Teaches or has taught the following course(s):{' '}
                    {uniqueReviews.map((review, index) => (
                      <Fragment key={index}>
                        <Link to={`/course/${review.courseId}`}>
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
            </div>

            <div className='m-4 mx-auto hidden w-fit flex-col items-center justify-center space-y-3 md:m-4 md:flex md:w-1/2 lg:flex-row'>
              {uniqueReviews.length && (
                <RatingInfo
                  title='Rating'
                  rating={averageRating}
                  numReviews={reviews.length}
                />
              )}
              {uniqueReviews.length && (
                <RatingInfo
                  title='Difficulty'
                  rating={averageDifficulty}
                  numReviews={reviews.length}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='flex w-full flex-row justify-between'>
        <div className='my-4 ml-8 mr-8 w-full md:mr-8 md:mt-4'>
          <div className='w-full'>
            {userReview && (
              <CourseReview
                canModify={false}
                handleDelete={() => undefined}
                includeTaughtBy={false}
                isLast={reviews.length === 1}
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
                    isLast={i === reviews.length - 1}
                    key={i}
                    openEditReview={() => undefined}
                    review={review}
                  />
                ))}
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
        </div>
      </div>
    </Layout>
  );
};
