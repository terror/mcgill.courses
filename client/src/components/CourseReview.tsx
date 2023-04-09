import { format } from 'date-fns';
import { Edit } from 'react-feather';
import { Link } from 'react-router-dom';

import { Review } from '../model/review';
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
    <div className='w-96 p-6 bg-slate-50 rounded-md'>
      <div className='flex'>
        <div className='flex flex-col w-full'>
          <div className='flex'>
            <div className='w-16 h-16 rounded-full bg-gray-200' />
            {canModify && (
              <div className='flex space-x-2 ml-auto mr-6'>
                <Link to={`/review/${review.courseId}/edit`}>
                  <Edit className='hover:stroke-gray-500 transition duration-200' />
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
            <h2 className='leading-none mt-1 font-semibold text-gray-700'>
              Instructor:
            </h2>
            <p className='text-gray-700'>{review.instructor}</p>
          </div>
        </div>
        <div className='ml-auto w-fit'>
          <StarRating rating={review.rating} />
          <h2 className='leading-none mt-2 ml-1 font-bold text-sm  text-gray-700'>
            {dateStr}
          </h2>
        </div>
      </div>
      <div className='mt-6 text-md'>{review.content}</div>
    </div>
  );
};
