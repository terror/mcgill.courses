import { AiFillDislike, AiFillLike } from 'react-icons/ai';
import { DeleteButton } from './DeleteButton';
import { Edit } from 'react-feather';
import { Fragment, useEffect, useState } from 'react';
import { Interaction, InteractionKind } from '../model/Interaction';
import { Link } from 'react-router-dom';
import { Review } from '../model/Review';
import { StarRating } from './StarRating';
import { classNames } from '../lib/utils';
import { fetchClient } from '../lib/fetchClient';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { Alert } from './Alert';

type ReviewInteractionsProps = {
  courseId: string;
  userId: string;
};

const ReviewInteractions = ({ courseId, userId }: ReviewInteractionsProps) => {
  const user = useAuth();

  const [likes, setLikes] = useState(0);
  const [kind, setKind] = useState<InteractionKind | undefined>();
  const [error, setError] = useState('');

  useEffect(() => {
    refreshInteractions();
  }, []);

  const refreshInteractions = () => {
    fetchClient
      .getData<Interaction[]>(
        `/interactions?course_id=${courseId}&user_id=${userId}`
      )
      .then((interactions) => {
        setLikes(
          interactions.filter((interaction) => interaction.kind === 'like')
            .length -
            interactions.filter((interaction) => interaction.kind === 'dislike')
              .length
        );
        if (user)
          setKind(
            interactions.find(
              (interaction: Interaction) => interaction.referrer === user.id
            )?.kind
          );
      })
      .catch((err) => setError(err.toString()));
  };

  const addInteraction = (interactionKind: InteractionKind) => {
    if (!user) return;

    fetchClient
      .post(
        '/interactions',
        {
          kind: interactionKind,
          course_id: courseId,
          user_id: userId,
          referrer: user.id,
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then(() => refreshInteractions())
      .catch((err) => setError(err.toString()));
  };

  const removeInteraction = () => {
    if (!user) return;

    fetchClient
      .delete(
        '/interactions',
        {
          course_id: courseId,
          user_id: userId,
          referrer: user.id,
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then(() => refreshInteractions())
      .catch((err) => setError(err.toString()));
  };

  const handleLike = () => {
    kind === 'like' ? removeInteraction() : addInteraction('like');
  };

  const handleDislike = () => {
    kind === 'dislike' ? removeInteraction() : addInteraction('dislike');
  };

  return (
    <Fragment>
      {error ? <Alert status='error' message={error} /> : null}
      <div className='mb-0.5 flex items-center'>
        <button className='flex h-8 w-8 items-center justify-center rounded-md text-gray-700 focus:outline-none dark:text-white'>
          <AiFillLike
            onClick={handleLike}
            className={classNames(
              'h-4 w-4',
              kind === 'like' ? 'fill-red-600' : ''
            )}
          />
        </button>
        <span className='text-sm font-bold text-gray-700 dark:text-white'>
          {likes}
        </span>
        <button className='flex h-8 w-8 items-center justify-center rounded-md text-gray-700 focus:outline-none dark:text-white'>
          <AiFillDislike
            onClick={handleDislike}
            className={classNames(
              'h-4 w-4',
              kind === 'dislike' ? 'fill-red-600' : ''
            )}
          />
        </button>
      </div>
    </Fragment>
  );
};

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
  includeTaughtBy = true,
}: CourseReviewProps) => {
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
          <ReviewInteractions
            courseId={review.courseId}
            userId={review.userId}
          />
        </div>
      </div>
    </div>
  );
};
