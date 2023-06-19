import { useEffect } from 'react';

import { useDarkMode } from '../hooks/useDarkMode';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

type LayoutProps = {
  children: React.ReactNode;
  preventScroll?: boolean;
};

export const Layout = ({ children, preventScroll }: LayoutProps) => {
  const [darkMode] = useDarkMode();

  useEffect(() => {
    if (!preventScroll) window.scrollTo(0, 0);
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className='transition-color min-h-screen overflow-auto pb-5 transition duration-300 ease-in-out dark:bg-neutral-900'>
        <Navbar />
        <main className='lg:mx:40 mx-8 sm:mx-16 md:mx-24 xl:mx-48'>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};
