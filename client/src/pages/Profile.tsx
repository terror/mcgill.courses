import { Tab } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { User } from 'react-feather';
import { LuFileText } from 'react-icons/lu';
import { VscBell } from 'react-icons/vsc';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

import { CourseReview } from '../components/CourseReview';
import { DeleteButton } from '../components/DeleteButton';
import { JumpToTopButton } from '../components/JumpToTopButton';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { repo } from '../lib/repo';
import { courseIdToUrlParam } from '../lib/utils';
import { spliceCourseCode } from '../lib/utils';
import type { Review } from '../model/Review';
import type { Subscription } from '../model/Subscription';

export const Profile = () => {
  const user = useAuth();

  const [userReviews, setUserReviews] = useState<Review[]>();
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>();

  useEffect(() => {
    if (!user) return;

    repo
      .getReviews(user.id)
      .then((data) => setUserReviews(data))
      .catch(() =>
        toast.error(
          'An error occurred while fetching your reviews, please try again later.'
        )
      );

    repo
      .getSubscriptions()
      .then((data) => setUserSubscriptions(data))
      .catch(() =>
        toast.error(
          'An error occurred while fetching your subscriptions, please try again later.'
        )
      );
  }, []);

  const removeSubscription = async (courseId: string) => {
    try {
      await repo.removeSubscription(courseId);
      setUserSubscriptions(
        userSubscriptions?.filter(
          (subscription) => subscription.courseId !== courseId
        )
      );
      toast.success(
        `Subscription for course ${spliceCourseCode(
          courseId,
          ' '
        )} removed successfully.`
      );
    } catch (err) {
      toast.error(
        'An error occurred while removing your subscription, please try again later.'
      );
    }
  };

  const tabs = ['Reviews', 'Subscriptions'];

  return (
    <Layout>
      <div className='mx-auto max-w-2xl'>
        <JumpToTopButton />
        <div className='flex w-full justify-center'>
          <div className='mx-4 flex w-full flex-row rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mt-10'>
            <div className='flex w-fit flex-col space-y-3 md:m-4'>
              <User size={64} className={'-ml-3 text-gray-500'} />
              <h1 className='text-lg font-medium text-gray-700 dark:text-gray-300 md:text-xl'>
                Your Profile
              </h1>
              <div className='flex items-center gap-x-1'>
                <LuFileText
                  className='text-neutral-500 dark:text-gray-400'
                  aria-hidden='true'
                  size={20}
                />
                <p className='text-gray-700 dark:text-gray-300'>
                  {userReviews?.length}{' '}
                  {'review' + (userReviews?.length === 1 ? '' : 's')}
                </p>
              </div>
              <div className='flex items-center gap-x-1'>
                <VscBell
                  className='stroke-[0.2] text-neutral-500 dark:text-gray-400'
                  aria-hidden='true'
                  size={20}
                />
                <p className='text-gray-700 dark:text-gray-300'>
                  {userSubscriptions?.length}{' '}
                  {'subscription' +
                    (userSubscriptions?.length === 1 ? '' : 's')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Tab.Group>
          <Tab.List className='m-4 flex space-x-1 rounded-xl bg-slate-200 p-1 dark:bg-neutral-700/20'>
            {tabs.map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  twMerge(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-gray-800',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-400 focus:outline-none',
                    selected
                      ? 'bg-white shadow'
                      : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-400 dark:text-gray-200'
                  )
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className='m-4'>
                {userReviews === undefined ? (
                  <div className='mt-2 text-center'>
                    <Spinner />
                  </div>
                ) : userReviews.length ? (
                  userReviews
                    .sort(
                      (a, b) =>
                        parseInt(a.timestamp.$date.$numberLong, 10) -
                        parseInt(b.timestamp.$date.$numberLong, 10)
                    )
                    .map((review, i) => {
                      return (
                        <div key={i}>
                          <div className='flex'>
                            <Link
                              to={`/course/${courseIdToUrlParam(
                                review.courseId
                              )}`}
                              className='text-xl font-bold text-gray-700 duration-200 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-500'
                            >
                              {spliceCourseCode(review.courseId, ' ')}
                            </Link>
                          </div>
                          <div className='my-2 rounded-lg border-gray-800 duration-300 ease-in-out'>
                            <CourseReview
                              canModify={false}
                              handleDelete={() => null}
                              openEditReview={() => null}
                              review={review}
                            />
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className='flex w-full items-center justify-center gap-x-2'>
                    <LuFileText
                      className='stroke-[1.25] text-gray-400 dark:text-gray-600'
                      size={40}
                    />
                    <div className='text-center text-sm text-gray-600 dark:text-gray-500'>
                      No reviews found, if you've taken a course in the past,
                      don't be shy to leave a review!
                    </div>
                  </div>
                )}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className='m-4'>
                {userSubscriptions?.length !== 0 ? (
                  userSubscriptions?.map((subscription, i) => (
                    <div
                      key={i}
                      className='m-4 flex items-center rounded-lg border-gray-800 bg-white p-4 duration-300 ease-in-out dark:bg-neutral-800'
                    >
                      <Link
                        className='font-semibold text-gray-800 dark:text-gray-200'
                        to={`/course/${courseIdToUrlParam(
                          subscription.courseId
                        )}`}
                      >
                        {subscription.courseId}
                      </Link>
                      <DeleteButton
                        title='Delete Subscription'
                        className='ml-auto'
                        text={`Are you sure you want to delete your subscription for ${subscription.courseId}? `}
                        onConfirm={() =>
                          removeSubscription(subscription.courseId)
                        }
                        size={20}
                      />
                    </div>
                  ))
                ) : (
                  <div className='flex w-full items-center justify-center gap-x-1'>
                    <VscBell
                      className='text-gray-400 dark:text-gray-600'
                      aria-hidden='true'
                      size={32}
                    />
                    <div className='text-center text-sm text-gray-600 dark:text-gray-500'>
                      No subscriptions found, click the bell icon on a course to
                      add one!
                    </div>
                  </div>
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
};
