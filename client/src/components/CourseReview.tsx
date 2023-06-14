import { AiFillDislike, AiFillLike } from 'react-icons/ai';
import { DeleteButton } from './DeleteButton';
import { Edit } from 'react-feather';
import { Fragment, useEffect, useState } from 'react';
import { Like } from '../model/Like';
import { Link } from 'react-router-dom';
import { Review } from '../model/Review';
import { StarRating } from './StarRating';
import { classNames } from '../lib/utils';
import { fetchClient } from '../lib/fetchClient';
import { format } from 'date-fns';

type CourseReviewProps = {
  canModify: boolean;
  handleDelete: () => void;
  isLast: boolean;
  openEditReview: () => void;
  review: Review;
  showCourse?: boolean;
  includeTaughtBy?: boolean;
};

export const CourseReview = ({
  review,
  canModify,
  isLast,
  openEditReview,
  handleDelete,
  showCourse,
  includeTaughtBy = true,
}: CourseReviewProps) => {
  showCourse = showCourse ?? false;

  const [likes, setLikes] = useState(0);
  const [readMore, setReadMore] = useState(false);

  const dateStr = format(
    new Date(parseInt(review.timestamp.$date.$numberLong, 10)),
    'PPP'
  );

  useEffect(() => {
    fetchClient
      .getData<Like[]>(`/likes?course_id=${review.courseId}&user_id=${review.userId}`)
      .then((data) => setLikes(data.length))
      .catch((err) => console.log(err));
  })

  const handleLike = () => {
    fetchClient
      .post('/likes', {
        course_id: review.courseId,
        user_id: review.userId,
      },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((_) => setLikes(likes + 1))
      .catch((err) => console.log(err));
  }

  const handleDislike = () => {
    fetchClient
      .delete('/likes', {
        course_id: review.courseId,
        user_id: review.userId,
      },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((_) => setLikes(likes + 1))
      .catch((err) => console.log(err));
  }

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
            <div className='mb-2 flex flex-col sm:flex-row sm:gap-4'>
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
              <div className='text-md ml-1 mr-4 mt-2 hyphens-auto text-left dark:text-gray-300'>
                {review.content}
              </div>
            ) : (
              <>
                <div className='text-md ml-1 mr-4 mt-2 hyphens-auto text-left dark:text-gray-300'>
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
        <p className='mb-2 mt-auto flex-1 text-sm italic leading-4 text-gray-700 dark:text-gray-200'>
          {includeTaughtBy ? (
            <Fragment>
              Taught by{' '}
              {review.instructors.map((instructor, i) => {
                let separator = null;
                if (i === review.instructors.length - 2) {
                  separator = ' and ';
                } else if (i < review.instructors.length - 2) {
                  separator = ', ';
                }
                return (
                  <Fragment key={instructor + review.userId}>
                    <Link
                      to={`/instructor/${encodeURIComponent(instructor)}`}
                      className='transition hover:text-red-600'
                    >
                      {instructor}
                    </Link>
                    {separator}
                  </Fragment>
                );
              })}
            </Fragment>
          ) : (
            <Fragment>
              Written for{' '}
              <Link to={`/course/${review.courseId}`}>{review.courseId}</Link>
            </Fragment>
          )}
        </p>
        <div className='flex items-center justify-end'>
          <p className='mr-4 text-sm font-bold text-gray-700 dark:text-gray-200'>
            {dateStr}
          </p>
          <div className='flex items-center'>
            <button className='flex h-8 w-8 items-center justify-center rounded-md text-gray-700 focus:outline-none dark:text-white'>
              <AiFillLike onClick={handleLike} className='h-4 w-4' />
            </button>
            <span className='text-sm font-bold text-gray-700 dark:text-white'>
              {likes === 0 ? likes : likes >= 0 ? `+${likes}` : `-${likes}`}
            </span>
          </div>
          <button className='ml-0.5 flex h-8 w-8 items-center justify-center rounded-md text-gray-700 focus:outline-none dark:text-white'>
            <AiFillDislike onClick={handleDislike} className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};
