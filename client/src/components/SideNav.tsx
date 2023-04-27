import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { navigation } from './Navbar';
import { DarkModeToggle } from './DarkModeToggle';
import { useDarkMode } from '../hooks/useDarkMode';

type SideNavProps = {
  open: boolean;
  onClose: (open: boolean) => void;
};

export const SideNav = ({ open, onClose }: SideNavProps) => {
  const user = useAuth();
  const [darkMode, _] = useDarkMode();

  return (
    <Dialog as='div' className='lg:hidden' open={open} onClose={onClose}>
      <div className='fixed inset-0 z-50' />
      <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 dark:bg-neutral-700 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
        <div className='flex items-center justify-between'>
          <a href='/' className='-m-1.5 p-1.5'>
            <img className='h-8 w-auto' src='bird.png' alt='' />
          </a>
          <button
            type='button'
            className='-m-2.5 rounded-md p-2.5 text-gray-700'
            onClick={() => onClose(false)}
          >
            <span className='sr-only'>Close menu</span>
            <XMarkIcon className='mr-6 mt-3 h-6 w-6' aria-hidden='true' />
          </button>
        </div>
        <div className='mt-6 flow-root'>
          <div className='-my-6 divide-y divide-gray-500/10'>
            <div className='space-y-2 py-6'>
              <DarkModeToggle />
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className='-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
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
                    className='-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                  >
                    Profile
                  </Link>
                  <a
                    href={`${import.meta.env.VITE_API_URL}/auth/logout`}
                    className='-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                  >
                    Log out
                  </a>
                </>
              ) : (
                <a
                  href={`${import.meta.env.VITE_API_URL}/auth/login`}
                  className='-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
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
