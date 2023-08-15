import { Bars3Icon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import birdImageUrl from '../assets/bird.png';
import { BellIcon } from '@heroicons/react/20/solid';
import { CourseSearchBar } from './CourseSearchBar';
import { DarkModeToggle } from './DarkModeToggle';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ProfileDropdown } from './ProfileDropdown';
import { SearchResults } from '../model/SearchResults';
import { SideNav } from './SideNav';
import { fetchClient } from '../lib/fetchClient';
import { getUrl } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { Notification } from '../model/Notification';

const NotificationDropdown = ({
  notifications,
}: {
  notifications: Notification[];
}) => {
  return (
    <div className='text-right'>
      <Menu as='div' className='relative inline-block text-left'>
        <div>
          <Menu.Button className='m-2 inline-flex justify-center text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'>
            <BellIcon
              className='-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100'
              aria-hidden='true'
            />
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
            <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
              <div className='px-1 py-1 '>
                {notifications.map((notification, i) => (
                  <Menu.Item key={i}>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-violet-500 text-white' : 'text-gray-900'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        {notification.courseId}
                      </button>
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

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [arrowColor, setArrowColor] = useState(
    'text-gray-900 dark:text-gray-200'
  );

  const [results, setResults] = useState<SearchResults>({
    query: '',
    courses: [],
    instructors: [],
  });

  const location = useLocation();
  const pathName = location.pathname;

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // TODO: alerts?
    // we really need a global/easy to use alert system.
    // aka this thing https://github.com/emilkowalski/sonner
    fetchClient
      .getData<Notification[]>('/notifications')
      .then((data) => setNotifications(data))
      .catch((err) => console.error(err));
    console.log(notifications);
  }, []);

  const handleInputChange = async (query: string) => {
    try {
      setResults({
        query,
        ...(await fetchClient.getData<SearchResults>(
          `/search?query=${encodeURIComponent(query)}`
        )),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const user = useAuth();

  // notifications.push({
  //   courseId: 'MATH240',
  //   seen: false,
  //   userId: user?.id || 'foo'
  // });

  return (
    <header className='z-40'>
      <nav
        className='z-40 flex items-center justify-between p-6 lg:px-8'
        aria-label='Global'
      >
        <div className='z-40 my-auto mr-auto flex lg:flex-1'>
          <Link to='/' className='-m-1.5 p-1.5'>
            <img className='h-12 w-auto' src={birdImageUrl} alt='bird' />
          </Link>
        </div>
        {pathName !== '/' ? (
          <div className='mx-8 my-auto hidden flex-1 justify-center align-middle sm:mx-12 sm:block md:mx-32'>
            <CourseSearchBar
              results={results}
              handleInputChange={handleInputChange}
            />
          </div>
        ) : null}
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200'
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className='sr-only'>Open main menu</span>
            <Bars3Icon className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>
        <div className='flex min-w-fit flex-row lg:flex-1'>
          <div className='my-auto hidden lg:ml-auto lg:flex lg:items-center lg:gap-x-8'>
            <DarkModeToggle />
          </div>
          <NotificationDropdown notifications={notifications} />
          <div className='hidden lg:ml-5 lg:flex lg:justify-end'>
            {user ? (
              <ProfileDropdown />
            ) : (
              <a
                href={`${getUrl()}/api/auth/login?redirect=${
                  window.location.href
                }`}
                className='my-auto text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200'
                onMouseEnter={() => setArrowColor('text-red-600')}
                onMouseLeave={() =>
                  setArrowColor('text-gray-900 dark:text-gray-200')
                }
              >
                Log in{' '}
                <span className={arrowColor} aria-hidden='true'>
                  &rarr;
                </span>{' '}
              </a>
            )}
          </div>
        </div>
      </nav>
      <SideNav open={mobileMenuOpen} onClose={setMobileMenuOpen} />
    </header>
  );
};
