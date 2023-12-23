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
      <div className='min-h-screen overflow-auto bg-slate-100 pb-5 transition duration-300 ease-in-out dark:bg-neutral-900'>
        <Navbar />
        <main className='mx-2 md:mx-16 lg:mx-24 xl:mx-40'>{children}</main>
      </div>
      <div className='hidden lg:block'>
        <Footer />
      </div>
    </div>
  );
};
