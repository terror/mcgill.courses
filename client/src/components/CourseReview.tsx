import { format } from 'date-fns';
import { Edit } from 'react-feather';
import { Link } from 'react-router-dom';

import { Review } from '../model/Review';
import { DeleteButton } from './DeleteButton';
import { StarRating } from './StarRating';

type CourseReviewProps = {
  review: Review;
  canModify: boolean;
  handleDelete: () => void;
};

export const CourseReview = ({
  review,
  canModify,
  handleDelete,
}: CourseReviewProps) => {
  const dateStr = format(new Date(review.timestamp), 'MMM d, yyyy');

  return (
    <div className='w-96 rounded-md bg-slate-50 p-6'>
      <div className='flex'>
        <div className='flex w-full flex-col'>
          <div className='flex'>
            <div className='h-16 w-16 rounded-full bg-gray-200' />
            {canModify && (
              <div className='ml-auto mr-6 flex space-x-2'>
                <Link to={`/review/${review.courseId}/edit`}>
                  <Edit className='transition duration-200 hover:stroke-gray-500' />
                </Link>
                <DeleteButton
                  title='Delete Review'
                  text={`Are you sure you want to delete your review of ${review.courseId}? `}
                  onConfirm={handleDelete}
                />
              </div>
            )}
          </div>
          <div className='mt-2 text-sm'>
            <h2 className='mt-1 font-semibold leading-none text-gray-700'>
              Instructor:
            </h2>
            <p className='text-gray-700'>{review.instructor}</p>
          </div>
        </div>
        <div className='ml-auto w-fit'>
          <StarRating rating={review.rating} />
          <h2 className='mt-2 ml-1 text-sm font-bold leading-none  text-gray-700'>
            {dateStr}
          </h2>
        </div>
      </div>
      <div className='text-md mt-6'>{review.content}</div>
    </div>
  );
};
