import { format } from 'date-fns';
import { Edit } from 'react-feather';

import { Review } from '../model/Review';
import { DeleteButton } from './DeleteButton';
import { StarRating } from './StarRating';

type CourseReviewProps = {
  review: Review;
  canModify: boolean;
  openEditReview: () => void;
  handleDelete: () => void;
};

export const CourseReview = ({
  review,
  canModify,
  openEditReview,
  handleDelete,
}: CourseReviewProps) => {
  const dateStr = format(
    new Date(parseInt(review.timestamp.$date.$numberLong, 10)),
    'MMM d, yyyy'
  );

  return (
    <div className='w-96 rounded-md bg-slate-50 p-6 dark:bg-neutral-800'>
      <div className='flex'>
        <div className='flex w-full flex-col'>
          <div className='flex'>
            <div className='mt-2 text-sm'>
              <h2 className='font-semibold leading-none text-gray-700 dark:text-gray-200'>
                Instructor:
              </h2>
              <p className='mt-1.5 text-gray-700 dark:text-gray-200'>
                {review.instructor}
              </p>
            </div>
            {canModify && (
              <div className='ml-auto mr-4 flex h-fit space-x-2'>
                <div onClick={openEditReview}>
                  <Edit className='cursor-pointer transition duration-200 hover:stroke-gray-500 dark:stroke-gray-200 dark:hover:stroke-gray-400' />
                </div>
                <DeleteButton
                  title='Delete Review'
                  text={`Are you sure you want to delete your review of ${review.courseId}? `}
                  onConfirm={handleDelete}
                />
              </div>
            )}
          </div>
        </div>
        <div className='ml-auto w-fit'>
          <StarRating rating={review.rating} />
          <h2 className='ml-1 mt-2 text-sm font-bold leading-none text-gray-700 dark:text-gray-200'>
            {dateStr}
          </h2>
        </div>
      </div>
      <div className='text-md mr-4 mt-6 dark:text-gray-300'>
        {review.content}
      </div>
    </div>
  );
};
