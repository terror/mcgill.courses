import { CourseReview } from '../components/CourseReview';
import { JumpToTopButton } from '../components/JumpToTopButton';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { Review } from '../model/Review';
import { Spinner } from '../components/Spinner';
import { User } from 'react-feather';
import { courseIdToUrlParam } from '../lib/utils';
import { repo } from '../lib/repo';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { useEffect, useState } from 'react';
import { Subscription } from '../model/Subscription';
import { LuFileText } from 'react-icons/lu';
import { VscBell } from 'react-icons/vsc';
import { spliceCourseCode } from '../lib/utils';
import { Tab } from '@headlessui/react';
import { FaTrash } from 'react-icons/fa';

export const Profile = () => {
  const user = useAuth();

  const [darkMode] = useDarkMode();

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
      <JumpToTopButton />
      <div className='flex w-full justify-center'>
        <div className='mx-4 flex w-full flex-row rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mt-10'>
          <div className='flex w-fit flex-col space-y-3 md:m-4'>
            <User
              size={100}
              className={twMerge(
                '-ml-3',
                darkMode ? 'text-white' : 'text-gray-700'
              )}
            />
            <h1 className='font-semibold text-gray-800 dark:text-gray-200 md:text-2xl'>
              {user?.mail}
            </h1>
            <div className='flex items-center gap-x-2'>
              <LuFileText
                className='text-neutral-700 dark:text-white'
                aria-hidden='true'
                size={30}
              />
              <p className='font-semibold text-gray-800 dark:text-gray-200'>
                {userReviews?.length} review(s)
              </p>
            </div>
            <div className='flex items-center gap-x-2'>
              <VscBell
                className='stroke-[0.5] text-neutral-700 dark:text-white'
                aria-hidden='true'
                size={30}
              />
              <p className='font-semibold text-gray-800 dark:text-gray-200'>
                {userSubscriptions?.length} subscriptions(s)
              </p>
            </div>
          </div>
        </div>
      </div>
      <Tab.Group>
        <Tab.List className='m-4 flex space-x-1 rounded-xl bg-neutral-700/20 p-1'>
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                twMerge(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-gray-700',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-gray-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white shadow'
                    : 'text-gray-100 hover:bg-white/[0.12] hover:text-white'
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
                          <h2 className='flex-auto text-2xl font-bold text-gray-700 dark:text-gray-200'>
                            {spliceCourseCode(review.courseId, ' ')}
                          </h2>
                          <Link
                            to={`/course/${courseIdToUrlParam(
                              review.courseId
                            )}`}
                            className='flex-auto text-right text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50'
                          >
                            View Course
                          </Link>
                        </div>
                        <div className='my-4 rounded-lg border-gray-800 duration-300 ease-in-out'>
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
              ) : null}
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div>
              {userSubscriptions?.map((subscription) => (
                <div className='m-4 flex items-center rounded-lg border-gray-800 bg-white p-4 duration-300 ease-in-out dark:bg-neutral-800'>
                  <p className='font-semibold text-gray-800 dark:text-gray-200'>
                    {subscription.courseId}
                  </p>
                  <FaTrash
                    onClick={() => removeSubscription(subscription.courseId)}
                    className='ml-auto dark:text-white'
                  />
                </div>
              ))}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </Layout>
  );
};
