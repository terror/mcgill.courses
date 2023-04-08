import { Bars3Icon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { classNames } from '../lib/classNames';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';
import { CourseSearchBar } from './CourseSearchBar';
import { NavItem } from './NavItem';
import { ProfileDropdown } from './ProfileDropdown';
import { SideNav } from './SideNav';

export const navigation = [
  { name: 'Explore', href: '/explore' },
  { name: 'About', href: '/about' },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Course[]>([]);

  const location = useLocation();
  const pathName = location.pathname;

  const handleInputChange = async (query: string) => {
    try {
      setSearchResults(
        await fetchClient.getData<Course[]>(
          `/search?query=${encodeURIComponent(query)}`
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const user = useAuth();

  return (
    <header className='z-50'>
      <nav
        className='flex items-center p-6 lg:px-8 justify-between'
        aria-label='Global'
      >
        <div className='flex lg:flex-1 mr-auto my-auto'>
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
        {pathName !== '/' ? (
          <div className='hidden my-auto lg:flex align-middle justify-center flex-1 my-auto'>
            <CourseSearchBar
              results={searchResults}
              handleInputChange={handleInputChange}
            />
          </div>
        ) : null}
        <div className='flex flex-row lg:flex-1 min-w-fit ml-6'>
          <div className='hidden my-auto lg:flex lg:gap-x-12 lg:ml-auto'>
            {navigation.map((item) => (
              <NavItem name={item.name} href={item.href} key={item.name} />
            ))}
          </div>
          <div className='hidden lg:flex lg:justify-end lg:ml-12'>
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
        </div>
      </nav>
      <SideNav open={mobileMenuOpen} onClose={setMobileMenuOpen} />
    </header>
  );
};
