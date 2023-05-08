import { format } from 'date-fns';
import { Edit } from 'react-feather';
import { useState } from 'react';

import { Review } from '../model/Review';
import { DeleteButton } from './DeleteButton';
import { StarRating } from './StarRating';

type CourseReviewProps = {
  review: Review;
  canModify: boolean;
  openEditReview: () => void;
  handleDelete: () => void;
  showCourse?: boolean;
};

export const CourseReview = ({
  review,
  canModify,
  openEditReview,
  handleDelete,
  showCourse,
}: CourseReviewProps) => {
  showCourse = showCourse ?? false;

  const [readMore, setReadMore] = useState(false);

  const dateStr = format(
    new Date(parseInt(review.timestamp.$date.$numberLong, 10)),
    'MMM d, yyyy'
  );

  return (
    <div className='flex w-full flex-col gap-4 rounded-md bg-slate-50 p-7 px-9 dark:bg-neutral-800'>
      <div className='flex flex-col '>
        <div className='flex justify-between'>
          <div className='flex flex-col'>
            <StarRating rating={review.rating} />
            {review.content.length < 200 || readMore ? (
              <div className='text-md ml-1 mr-4 mt-2 hyphens-auto text-justify dark:text-gray-300'>
                {review.content}
              </div>
            ) : (
              <>
                <div className='text-md ml-1 mr-4 mt-2 hyphens-auto text-justify dark:text-gray-300'>
                  {review.content.substring(0, 200) + '...'}
                </div>
                <button
                  className='duratio-300 ml-1 mr-auto text-gray-700 underline transition ease-in-out hover:text-red-500 dark:text-gray-300 dark:hover:text-red-500'
                  onClick={() => setReadMore(true)}
                >
                  Read More
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

      <div className='flex flex-row justify-between align-bottom'>
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
