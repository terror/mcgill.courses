import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { navigationItems } from './Footer';
import { DarkModeToggle } from './DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';
import { classNames } from '../lib/utils';

type SideNavProps = {
  open: boolean;
  onClose: (open: boolean) => void;
};

export const SideNav = ({ open, onClose }: SideNavProps) => {
  const user = useAuth();
  const [darkMode, _] = useDarkMode();

  return (
    <Dialog
      as='div'
      className={classNames('lg:hidden', darkMode ? 'dark' : '')}
      open={open}
      onClose={onClose}
    >
      <div className='fixed inset-0 z-50' />
      <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 dark:bg-neutral-800 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
        <div className='mt-1 flex items-center justify-between'>
          <div className='flex items-center'>
            <a href='/' className=''>
              <img className='h-8 w-auto' src='/bird.png' alt='' />
            </a>
            <div className='ml-6'>
              <DarkModeToggle />
            </div>
          </div>
          <button
            type='button'
            className='mr-2 rounded-2xl p-1 text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-700'
            onClick={() => onClose(false)}
          >
            <span className='sr-only'>Close menu</span>
            <XMarkIcon className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>
        <div className='mt-6 flow-root'>
          <div className='-my-6 divide-y divide-gray-500/10'>
            <div className='space-y-2 py-6'>
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-700'
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className='py-6'>
              {user ? (
                <>
                  <Link
                    to='/profile'
                    className='-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-700'
                  >
                    Profile
                  </Link>
                  <a
                    href={`${
                      import.meta.env.VITE_API_URL
                    }/auth/logout?redirect=${window.location.origin}`}
                    className='-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-gray-200  dark:hover:bg-neutral-700'
                  >
                    Log out
                  </a>
                </>
              ) : (
                <a
                  href={`${import.meta.env.VITE_API_URL}/auth/login?redirect=${
                    window.location.href
                  }`}
                  className='-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-gray-200  dark:hover:bg-neutral-700'
                >
                  Log in
                </a>
              )}
            </div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};
