import { useEffect } from 'react';
import { Navbar } from './Navbar';
import { useDarkMode } from '../hooks/useDarkMode';
import { Footer } from './Footer';
import { classNames } from '../lib/utils';

type LayoutProps = {
  children: React.ReactNode;
  preventScroll?: boolean;
};

export const Layout = ({ children, preventScroll }: LayoutProps) => {
  const [darkMode, _] = useDarkMode();

  useEffect(() => {
    if (!preventScroll) window.scrollTo(0, 0);
  }, []);

  return (
    <div className={classNames(darkMode ? 'dark' : '', 'min-h-screen')}>
      <div className='transition-color flex min-h-screen w-full flex-col justify-between overflow-auto transition duration-300 ease-in-out dark:bg-neutral-900 sm:overflow-visible'>
        <div>
          <Navbar />
          <main>{children}</main>
        </div>
        <div className='hidden lg:flex z-10'>
          <Footer />
        </div>
      </div>
    </div>
  );
};
