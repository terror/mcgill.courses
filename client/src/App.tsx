import React from 'react';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Product', href: '#' },
  { name: 'Features', href: '#' },
  { name: 'Marketplace', href: '#' },
  { name: 'Company', href: '#' },
];

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [results, setResults] = useState([]);

  const handleInputChange = async (query: string) => {
    try {
      setResults(
        await (
          await fetch(`http://localhost:8000/search?query=${query}`)
        ).json()
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='bg-white'>
      <header className='absolute inset-x-0 top-0 z-50'>
        <nav
          className='flex items-center justify-between p-6 lg:px-8'
          aria-label='Global'
        >
          <div className='flex lg:flex-1'>
            <a href='#' className='-m-1.5 p-1.5'>
              <span className='sr-only'>Your Company</span>
              <img
                className='h-12 w-auto'
                src='https://camo.githubusercontent.com/9d8561dcbe730f9db0fb62b0c1b2aecfdabecd2a95b86d7efe3224aedc1b8981/68747470733a2f2f73757065722d7374617469632d6173736574732e73332e616d617a6f6e6177732e636f6d2f36323936646338332d303562352d346261392d626435332d3830653135646330343933362f696d616765732f32646139363935302d323361362d343164392d626635382d3362363561346565333733372e706e67'
                alt=''
              />
            </a>
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
              <a
                key={item.name}
                href={item.href}
                className='text-sm font-semibold leading-6 text-gray-900'
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className='hidden lg:flex lg:flex-1 lg:justify-end'>
            <a
              href='#'
              className='text-sm font-semibold leading-6 text-gray-900'
            >
              Log in <span aria-hidden='true'>&rarr;</span>
            </a>
          </div>
        </nav>
        <Dialog
          as='div'
          className='lg:hidden'
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className='fixed inset-0 z-50' />
          <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
            <div className='flex items-center justify-between'>
              <a href='#' className='-m-1.5 p-1.5'>
                <span className='sr-only'>Your Company</span>
                <img
                  className='h-8 w-auto'
                  src='https://camo.githubusercontent.com/9d8561dcbe730f9db0fb62b0c1b2aecfdabecd2a95b86d7efe3224aedc1b8981/68747470733a2f2f73757065722d7374617469632d6173736574732e73332e616d617a6f6e6177732e636f6d2f36323936646338332d303562352d346261392d626435332d3830653135646330343933362f696d616765732f32646139363935302d323361362d343164392d626635382d3362363561346565333733372e706e67'
                  alt=''
                />
              </a>
              <button
                type='button'
                className='-m-2.5 rounded-md p-2.5 text-gray-700'
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className='sr-only'>Close menu</span>
                <XMarkIcon className='h-6 w-6' aria-hidden='true' />
              </button>
            </div>
            <div className='mt-6 flow-root'>
              <div className='-my-6 divide-y divide-gray-500/10'>
                <div className='space-y-2 py-6'>
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
                  <a
                    href='#'
                    className='-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
      <div className='relative isolate px-6 pt-14 lg:px-8'>
        <div className='mx-auto max-w-2xl py-32 sm:py-48 lg:py-56'>
          <div className='hidden sm:mb-8 sm:flex sm:justify-center'></div>
          <div className='text-center'>
            <h1 className='text-left text-5xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
              Explore thousands of course and professor reviews from McGill
              students
            </h1>
            <div class='relative w-full mt-4'>
              <div class='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                <svg
                  aria-hidden='true'
                  class='w-5 h-5 text-neutral-500 dark:text-neutral-400'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fill-rule='evenodd'
                    d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                    clip-rule='evenodd'
                  ></path>
                </svg>
              </div>
              <input
                type='text'
                class='bg-neutral-50 border border-neutral-50 text-black text-sm rounded-lg block w-full pl-10 p-2.5 dark:bg-neutral-50 dark:border-neutral-50 dark:placeholder-neutral-500 dark:text-black'
                placeholder='Search for courses, subjects or professors'
                onChange={(event) => handleInputChange(event.target.value)}
              />
            </div>
            {results.map((result, i) => (
              <div class='rounded-lg border p-2' key={i}>
                {result.subject}
                {result.code} - {result.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return <Home />;
};

export default App;
