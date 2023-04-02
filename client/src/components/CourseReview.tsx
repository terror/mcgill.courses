import { Edit, Star, Trash2 } from 'react-feather';
import { Link } from 'react-router-dom';

import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';
import { Instructor } from '../model/instructor';
import { Review } from '../model/review';
import { DeleteButton } from './DeleteButton';
import { Rating } from './Rating';
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
  return (
    <div className='w-96 p-6 bg-slate-50 rounded-md'>
      <div className='flex'>
        <div className='flex flex-col w-full'>
          <div className='flex'>
            <div className='w-16 h-16 rounded-full bg-gray-200' />
            {canModify && (
              <div className='flex space-x-2 ml-auto mr-6'>
                <Link to='/review/'>
                  <Edit />
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
          <StarRating rating={4} />
          <div className='ml-1 mt-6'>
            <Rating text='Difficulty' rating={4} />
            <Rating text='Useful' rating={3} />
            <Rating text='Interesting' rating={5} />
          </div>
        </div>
      </div>
      <div className='mt-6 text-sm'>{review.content}</div>
    </div>
  );
};
