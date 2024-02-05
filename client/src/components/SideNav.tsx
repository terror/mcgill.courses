import { Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import birdImageUrl from '../assets/bird.png';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { getUrl } from '../lib/utils';
import { DarkModeToggle } from './DarkModeToggle';
import { navigationItems } from './Footer';

type OverlayProps = {
  children: React.ReactNode;
};

const Overlay = ({ children }: OverlayProps) => {
  const root = document.getElementById('overlay-root');
  if (!root) {
    throw new Error('Overlay root element not present in document');
  }
  return ReactDOM.createPortal(children, root);
};

type SideNavProps = {
  open: boolean;
  onClose: (open: boolean) => void;
};

export const SideNav = ({ open, onClose }: SideNavProps) => {
  const user = useAuth();

  const [darkMode] = useDarkMode();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
  }, [open]);

  return (
    <Transition appear show={open}>
      <Overlay>
        <div
          className={twMerge(
            'fixed h-screen inset-0 z-50 flex items-end justify-end',
            darkMode ? 'dark' : ''
          )}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0' onClick={() => onClose(false)}>
              <div className='absolute inset-0 bg-black opacity-60'></div>
            </div>
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter='transform ease-in-out transition duration-500 sm:duration-300'
            enterFrom='translate-x-full'
            enterTo='translate-x-0'
            leave='transform ease-in-out transition duration-300'
            leaveFrom='translate-x-0'
            leaveTo='translate-x-full'
          >
            <div className='h-screen w-full overflow-y-auto bg-white p-6 dark:bg-neutral-800 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
              <div className='mt-1 flex items-center justify-between'>
                <div className='flex items-center'>
                  <Link to='/'>
                    <img
                      className='h-8 w-auto'
                      src={birdImageUrl}
                      alt='bird'
                      onClick={() => onClose(false)}
                    />
                  </Link>
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
                      <Link
                        key={item.name}
                        to={item.href}
                        className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-700'
                        onClick={() => onClose(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                    <Link
                      key={'privacy'}
                      to={'/privacy'}
                      className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-700'
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      key={'tos'}
                      to={'/tos'}
                      className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-neutral-700'
                    >
                      Terms and Conditions
                    </Link>
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
                          href={`${getUrl()}/api/auth/logout?redirect=${
                            window.location.origin
                          }`}
                          className='-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-gray-200  dark:hover:bg-neutral-700'
                        >
                          Log out
                        </a>
                      </>
                    ) : (
                      <a
                        href={`${getUrl()}/api/auth/login?redirect=${
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
            </div>
          </Transition.Child>
        </div>
      </Overlay>
    </Transition>
  );
};
