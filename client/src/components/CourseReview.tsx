import { format } from 'date-fns';
import { Edit } from 'react-feather';
import { useState } from 'react';

import { Review } from '../model/Review';
import { DeleteButton } from './DeleteButton';
import { StarRating } from './StarRating';
import { classNames } from '../lib/utils';

type CourseReviewProps = {
  canModify: boolean;
  handleDelete: () => void;
  isLast: boolean;
  openEditReview: () => void;
  review: Review;
  showCourse?: boolean;
};

export const CourseReview = ({
  review,
  canModify,
  isLast,
  openEditReview,
  handleDelete,
  showCourse,
}: CourseReviewProps) => {
  showCourse = showCourse ?? false;

  const [readMore, setReadMore] = useState(false);

  const dateStr = format(
    new Date(parseInt(review.timestamp.$date.$numberLong, 10)),
    'PPP'
  );

  return (
    <div
      className={classNames(
        isLast ? 'mb-8' : 'mb-4',
        'flex w-full flex-col gap-4 rounded-md bg-slate-50 p-7 px-9 dark:bg-neutral-800'
      )}
    >
      <div className='flex flex-col '>
        <div className='flex justify-between'>
          <div className='flex flex-col'>
            <div className='flex gap-6'>
              <div className='flex items-center'>
                <div className='text-md mr-1 font-bold text-gray-700 dark:text-gray-200'>
                  Rating:
                </div>
                <StarRating rating={review.rating} />
              </div>
              <div className='flex items-center'>
                <div className='text-md mr-1 font-bold text-gray-700 dark:text-gray-200'>
                  Difficulty:
                </div>
                <StarRating rating={review.difficulty} />
              </div>
            </div>
            {review.content.length < 300 || readMore ? (
              <div className='text-md hyphens-auto ml-1 mr-4 mt-2 text-left dark:text-gray-300'>
                {review.content}
              </div>
            ) : (
              <>
                <div className='text-md hyphens-auto ml-1 mr-4 mt-2 text-left dark:text-gray-300'>
                  {review.content.substring(0, 300) + '...'}
                </div>
                <button
                  className='ml-1 mr-auto pt-1 text-gray-700 underline transition duration-300 ease-in-out hover:text-red-500 dark:text-gray-300 dark:hover:text-red-500'
                  onClick={() => setReadMore(true)}
                >
                  Show more
                </button>
              </>
            )}
          </div>
          <div className='text-sm'>
            <div className='ml-auto flex'>
              {canModify && (
                <div className='ml-auto mr-1 flex h-fit space-x-2'>
                  <div onClick={openEditReview}>
                    <Edit
                      className='cursor-pointer transition duration-200 hover:stroke-gray-500 dark:stroke-gray-200 dark:hover:stroke-gray-400'
                      size={24}
                    />
                  </div>
                  <DeleteButton
                    title='Delete Review'
                    text={`Are you sure you want to delete your review of ${review.courseId}? `}
                    onConfirm={handleDelete}
                    size={24}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-row justify-between gap-3 align-bottom'>
        <p className='mb-2 mt-2 text-sm italic leading-none text-gray-700 dark:text-gray-200'>
          Taught by: {review.instructor}
        </p>
        <h2 className='ml-auto mt-2 text-sm font-bold leading-none text-gray-700 dark:text-gray-200'>
          {dateStr}
        </h2>
      </div>
    </div>
  );
};
