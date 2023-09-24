import { VscBell, VscBellDot } from 'react-icons/vsc';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Notification } from '../model/Notification';
import { CourseReview } from './CourseReview';
import { Link } from 'react-router-dom';
import { courseIdToUrlParam, spliceCourseCode } from '../lib/utils';

export const NotificationDropdown = ({
  notifications,
}: {
  notifications: Notification[];
}) => {
  return (
    <div className='z-20 text-right'>
      <Menu as='div' className='relative inline-block text-left'>
        <div>
          <Menu.Button className='m-2 inline-flex justify-center text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'>
            {notifications.length !== 0 ? (
              <VscBellDot
                className='hover:text-white-100 -mr-1 ml-2 h-5 w-5 stroke-[0.5] text-neutral-700 dark:text-white'
                aria-hidden='true'
              />
            ) : (
              <VscBell
                className='hover:text-white-100 -mr-1 ml-2 h-5 w-5 stroke-[0.5] text-neutral-700 dark:text-white'
                aria-hidden='true'
              />
            )}
          </Menu.Button>
        </div>
        {notifications.length !== 0 && (
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='w-100 absolute right-0 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-slate-100 shadow-lg dark:bg-neutral-900'>
              <div className='p-2'>
                {notifications.map((notification, i) => (
                  <Menu.Item key={i}>
                    {() => (
                      <div className='m-2'>
                        <div className='mb-2 flex items-center'>
                          <p className='font-semibold text-gray-800 dark:text-gray-200'>
                            {spliceCourseCode(
                              notification.review.courseId,
                              ' '
                            )}
                          </p>
                          <Link
                            to={`/course/${courseIdToUrlParam(
                              notification.review.courseId
                            )}`}
                            className='flex-auto text-right text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50'
                          >
                            View Course
                          </Link>
                        </div>
                        <CourseReview
                          review={notification.review}
                          canModify={false}
                          handleDelete={() => undefined}
                          openEditReview={() => undefined}
                        />
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        )}
      </Menu>
    </div>
  );
};
