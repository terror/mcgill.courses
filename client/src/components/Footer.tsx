import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { NavItem } from './NavItem';

export const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Explore', href: '/explore' },
  { name: 'About', href: '/about' },
];

export const Footer = () => {
  const location = useLocation();
  const [show, setShow] = useState(location.pathname === '/');
  let scrollPosition = window.pageYOffset;

  useEffect(() => {
    if (location.pathname === '/') {
      return;
    }

    const handleScroll = () => {
      const currentPosition = window.pageYOffset;
      if (currentPosition < scrollPosition) {
        setShow(false);
      } else {
        setShow(true);
      }
      scrollPosition = currentPosition;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollPosition]);

  return (
    <nav
      className='sticky bottom-0 flex w-full flex-row items-center justify-between overflow-hidden bg-neutral-100 transition-all duration-100 dark:bg-neutral-800'
      style={{ height: show ? 64 : 0 }}
    >
      <div className='ml-10 flex flex-row'>
        {navigationItems.map((item, i) => (
          <div key={i} className='mx-3'>
            <NavItem name={item.name} href={item.href} key={item.name} />
          </div>
        ))}
      </div>
      <div className='mr-10'>
        <NavItem name={'Privacy Policy'} href={'/privacy'} />
      </div>
    </nav>
  );
};
