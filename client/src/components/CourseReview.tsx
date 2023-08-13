import { Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { Fragment, useEffect, useState } from 'react';
import { Edit } from 'react-feather';
import { AiFillDislike, AiFillLike } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { courseIdToUrlParam } from '../lib/utils';
import { GetInteractionsPayload } from '../model/GetInteractionsPayload';
import { InteractionKind } from '../model/Interaction';
import { Review } from '../model/Review';
import { Alert } from './Alert';
import { DeleteButton } from './DeleteButton';
import { LuFlame } from 'react-icons/lu';
import { IconRating } from './IconRating';
import { BirdIcon } from './BirdIcon';

const LoginPrompt = () => {
  return (
    <div className='absolute bottom-20 end-4 h-fit rounded-md border bg-gray-100 px-2 py-1 text-neutral-800 dark:border-0 dark:bg-neutral-700 dark:text-gray-200 sm:bottom-16'>
      You must be logged in
    </div>
  );
};

type ReviewInteractionsProps = {
  courseId: string;
  userId: string;
  setPromptLogin: (_: boolean) => void;
};

const ReviewInteractions = ({
  courseId,
  userId,
  setPromptLogin,
}: ReviewInteractionsProps) => {
  const user = useAuth();

  const [error, setError] = useState('');
  const [kind, setKind] = useState<InteractionKind | undefined>();
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    refreshInteractions();
  }, []);

  const refreshInteractions = () => {
    fetchClient
      .getData<GetInteractionsPayload>(
        `/interactions?course_id=${courseId}&user_id=${userId}&referrer=${user?.id}`
      )
      .then((payload: GetInteractionsPayload) => {
        setKind(payload.kind);
        setLikes(payload.likes);
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

  const displayLoginPrompt = () => {
    setPromptLogin(true);
    setTimeout(() => setPromptLogin(false), 3000);
  };

  const handleLike = () => {
    user
      ? kind === 'like'
        ? removeInteraction()
        : addInteraction('like')
      : displayLoginPrompt();
  };

  const handleDislike = () => {
    user
      ? kind === 'dislike'
        ? removeInteraction()
        : addInteraction('dislike')
      : displayLoginPrompt();
  };

  return (
    <Fragment>
      {error ? <Alert status='error' message={error} /> : null}
      <div className='mb-0.5 flex items-center'>
        <div className='flex h-8 w-8 items-center justify-center rounded-md text-gray-700 focus:outline-none dark:text-white'>
          <AiFillLike
            onClick={handleLike}
            className={twMerge(
              'h-4 w-4 cursor-pointer',
              kind === 'like' ? 'fill-red-600' : ''
            )}
          />
        </div>
        <span className='text-sm font-bold text-gray-700 dark:text-white'>
          {likes}
        </span>
        <div className='flex h-8 w-8 items-center justify-center rounded-md text-gray-700 focus:outline-none dark:text-white'>
          <AiFillDislike
            onClick={handleDislike}
            className={twMerge(
              'h-4 w-4 cursor-pointer',
              kind === 'dislike' ? 'fill-red-600' : ''
            )}
          />
        </div>
      </div>
    </Fragment>
  );
};

type CourseReviewProps = {
  canModify: boolean;
  handleDelete: () => void;
  openEditReview: () => void;
  review: Review;
  showCourse?: boolean;
  includeTaughtBy?: boolean;
};

export const CourseReview = ({
  review,
  canModify,
  openEditReview,
  handleDelete,
  includeTaughtBy = true,
}: CourseReviewProps) => {
  const [readMore, setReadMore] = useState(false);
  const [promptLogin, setPromptLogin] = useState(false);

  const dateStr = format(
    new Date(parseInt(review.timestamp.$date.$numberLong, 10)),
    'P'
  );

  return (
    <div
      className={
        'relative flex w-full flex-col gap-4 border-b-[1px] border-b-gray-300 bg-slate-50 px-6 py-3 last:border-b-0 dark:bg-neutral-800'
      }
    >
      <div className='flex flex-col'>
        <div className='flex w-full'>
          <div className='relative flex w-full flex-col'>
            <div className='flex w-full'>
              <p className='py-2 text-xs font-medium text-gray-700 dark:text-gray-200'>
                {dateStr}
              </p>
              <div className='grow' />
              <div className='flex w-64 flex-col items-end rounded-lg p-2'>
                <div className='flex items-center gap-x-2'>
                  <div className='text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Rating
                  </div>
                  <IconRating rating={review.rating} icon={BirdIcon} />
                </div>
                <div className='flex items-center gap-x-2'>
                  <div className='text-xs font-medium uppercase tracking-wider text-gray-500'>
                    Difficulty
                  </div>
                  <IconRating rating={review.difficulty} icon={LuFlame} />
                </div>
              </div>
            </div>
            {review.content.length < 300 || readMore ? (
              <div className='ml-1 mr-4 mt-2 hyphens-auto text-left text-gray-800 dark:text-gray-300'>
                {review.content}
              </div>
            ) : (
              <>
                <div className='ml-1 mr-4 mt-2 hyphens-auto text-left text-gray-800 dark:text-gray-300'>
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
      <div className='flex items-center'>
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
                      className='font-medium transition hover:text-red-600'
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
              <Link to={`/course/${courseIdToUrlParam(review.courseId)}`}>
                {review.courseId}
              </Link>
            </Fragment>
          )}
        </p>
        <Transition
          show={promptLogin}
          enter='transition-opacity duration-150'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='transition-opacity duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <LoginPrompt />
        </Transition>
        <div>
          <ReviewInteractions
            courseId={review.courseId}
            userId={review.userId}
            setPromptLogin={setPromptLogin}
          />
        </div>
      </div>
    </div>
  );
};
