import { Bars3Icon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { classNames } from '../lib/classNames';
import { ProfileDropdown } from './ProfileDropdown';
import { SideNav } from './SideNav';

export const navigation = [
  { name: 'Explore', href: '/explore' },
  { name: 'About', href: '/about' },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const user = useAuth();

  const redUnderlineStyle =
    'before:content before:absolute before:block before:w-full before:h-[2px] before:bottom-0 before:left-0 before:bg-red-600';

  return (
    <header className='z-50'>
      <nav
        className='flex items-center justify-between p-6 lg:px-8'
        aria-label='Global'
      >
        <div className='flex lg:flex-1'>
          <Link to='/' className='-m-1.5 p-1.5'>
            <img className='h-12 w-auto' src='/bird.png' alt='bird' />
          </Link>
        </div>
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className='sr-only'>Open main menu</span>
            <Bars3Icon className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>
        <div className='hidden lg:flex lg:gap-x-12'>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={classNames(
                'text-sm font-semibold leading-6 text-gray-900 relative',
                location.pathname === item.href
                  ? redUnderlineStyle
                  : classNames(
                      redUnderlineStyle,
                      'before:hover:scale-x-100 before:scale-x-0 before:origin-top-left before:transition before:ease-in-out before:duration-300'
                    )
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className='hidden lg:flex lg:flex-1 lg:justify-end'>
          {user ? (
            <ProfileDropdown />
          ) : (
            <a
              href={`${import.meta.env.VITE_API_URL}/auth/login`}
              className='text-sm font-semibold leading-6 text-gray-900'
            >
              Log in <span aria-hidden='true'>&rarr;</span>
            </a>
          )}
        </div>
      </nav>
      <SideNav open={mobileMenuOpen} onClose={setMobileMenuOpen} />
    </header>
  );
};
