import { VscBell, VscBellDot } from 'react-icons/vsc';
import React, { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Notification } from '../model/Notification';
import { CourseReview } from './CourseReview';
import { Link } from 'react-router-dom';
import { courseIdToUrlParam, spliceCourseCode } from '../lib/utils';
import { GoDotFill } from 'react-icons/go';
import { FaTrash } from 'react-icons/fa';
import { repo } from '../lib/repo';
import { toast } from 'sonner';

export const NotificationDropdown = ({
  notifications,
  setNotifications,
}: {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
}) => {
  const [refs, setRefs] = useState<React.RefObject<HTMLDivElement>[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    setRefs(notifications.map(() => React.createRef<HTMLDivElement>()));
  }, [notifications]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    notifications.forEach((notification, index) => {
      const ref = refs[index];

      if (ref && ref.current) {
        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
          entries.forEach((entry: IntersectionObserverEntry) => {
            if (entry.isIntersecting) updateNotification(notification);
          });
        };

        const observer = new IntersectionObserver(handleIntersection);
        observer.observe(ref.current as Element);

        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [notifications, refs, isMenuOpen]);

  useEffect(() => {
    if (seen.size === 0) return;

    setNotifications(
      notifications.map((n) => {
        return seen.has(n.review.courseId) ? { ...n, seen: true } : n;
      })
    );

    setSeen(new Set());
  }, [isMenuOpen]);

  const updateNotification = async (notification: Notification) => {
    if (notification.seen) return;

    try {
      await repo.updateNotification(
        notification.review.courseId,
        notification.review.userId,
        true
      );
    } catch (err) {
      toast.error('Failed to update notification.');
    } finally {
      seen.add(notification.review.courseId);
    }
  };

  const deleteNotification = async (courseId: string) => {
    try {
      await repo.deleteNotification(courseId);
      toast.success('Successfully deleted notification.');
    } catch (err) {
      toast.error('Failed to delete notification.');
    } finally {
      setNotifications(
        notifications.filter(
          (notification) => notification.review.courseId !== courseId
        )
      );
    }
  };

  return (
    <div className='z-20 text-right'>
      <Menu as='div' className='relative inline-block text-left'>
        {({ open }) => {
          useEffect(() => {
            setIsMenuOpen(open);
          }, [open]);

          return (
            <>
              <div>
                <Menu.Button className='m-2 inline-flex justify-center text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'>
                  {notifications.filter((notification) => !notification.seen)
                    .length !== 0 ? (
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
                  <Menu.Items className='autocomplete absolute right-0 z-20 mt-2 max-h-[800px] max-w-[325px] origin-top-right divide-y divide-gray-100 overflow-auto rounded-md bg-slate-100 shadow-lg dark:bg-neutral-900 md:max-w-[800px]'>
                    <div className='p-2'>
                      {notifications.map((notification, i) => (
                        <Menu.Item key={i}>
                          {() => (
                            <div className='m-2' ref={refs[i]}>
                              <div className='mb-2 flex items-center'>
                                <div className='flex items-center gap-x-1'>
                                  <p className='font-semibold text-gray-800 dark:text-gray-200'>
                                    <Link
                                      to={`/course/${courseIdToUrlParam(
                                        notification.review.courseId
                                      )}`}
                                    >
                                      {spliceCourseCode(
                                        notification.review.courseId,
                                        ' '
                                      )}
                                    </Link>
                                  </p>
                                  {!notification.seen && (
                                    <GoDotFill className='text-red-400' />
                                  )}
                                </div>
                                <FaTrash
                                  onClick={async () =>
                                    await deleteNotification(
                                      notification.review.courseId
                                    )
                                  }
                                  className='ml-auto text-right text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50'
                                />
                              </div>
                              <CourseReview
                                className='rounded-md'
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
            </>
          );
        }}
      </Menu>
    </div>
  );
};
