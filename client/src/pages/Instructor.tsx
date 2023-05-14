import _ from 'lodash';
import { CourseReview } from '../components/CourseReview';
import { Layout } from '../components/Layout';
import { RatingInfo } from '../components/RatingInfo';
import { Review } from '../model/Review';
import { fetchClient } from '../lib/fetchClient';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const Instructor = () => {
  const params = useParams<{ name: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchClient
      .getData<Review[]>(
        `/reviews?instructor_name=${params.name
          ?.split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}`
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
  });

  const averageRating = _.sumBy(reviews, (r) => r.rating) / reviews.length;

  return (
    <Layout>
      <div className='flex justify-center'>
        <div className='mx-8 flex w-screen flex-row rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mt-10'>
          <div className='flex flex-1 flex-col md:flex-row'>
            <div className='m-4 flex w-fit flex-col space-y-3 md:m-4 md:w-1/2'>
              <div className='flex flex-row space-x-2 align-middle'>
                <h1 className='break-words text-4xl font-semibold text-gray-800 dark:text-gray-200'>
                  {params.name
                    ?.split('-')
                    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
                    .join(' ')}
                </h1>
              </div>
              <div className='m-4 mx-auto flex w-fit flex-col items-center justify-center space-y-3 md:hidden'>
                <RatingInfo
                  rating={averageRating}
                  numReviews={reviews.length}
                />
              </div>
              <p className='break-words text-gray-500 dark:text-gray-400'>
                Teaches or has taught the following courses:{' '}
                {[...new Set(reviews.map((review) => review.courseId))]
                  .sort()
                  .join(', ')}
                .
              </p>
            </div>
            <div className='m-4 mx-auto hidden w-fit flex-col items-center justify-center space-y-3 md:m-4 md:flex md:w-1/2'>
              <RatingInfo rating={averageRating} numReviews={reviews.length} />
            </div>
          </div>
        </div>
      </div>
      <div className='flex w-full flex-row justify-between'>
        <div className='my-4 ml-8 mr-8 w-full md:mr-8 md:mt-4'>
          <div className='w-full'>
            {reviews.map((review, i) => (
              <CourseReview
                key={i}
                canModify={false}
                handleDelete={() => null}
                isLast={i === reviews.length - 1}
                openEditReview={() => null}
                review={review}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
