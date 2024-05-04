import { useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

import { compareTerms } from '../lib/utils';
import { TermAverage } from '../model/TermAverage';

type CourseAveragesProps = {
  averages: TermAverage[];
};

export const CourseAverages = ({ averages }: CourseAveragesProps) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  return (
    <div
      className={
        'relative w-full rounded-md bg-slate-50 p-5 shadow-sm dark:bg-neutral-800'
      }
    >
      <h2 className='mb-2 mt-1 text-lg font-bold leading-none text-gray-700 dark:text-gray-200 md:text-xl'>
        Class Averages
      </h2>

      <hr className='my-2 mt-5 w-full border border-neutral-200 dark:border-neutral-700' />

      {averages
        .sort((a, b) => compareTerms(b.term, a.term))
        .slice(0, showAll ? averages.length : 6)
        .map((average) => (
          <>
            <div className='flex flex-row text-sm font-medium text-gray-500 dark:text-gray-400 md:text-lg'>
              <p className='w-11/12'>{average.term}</p>
              <p>{average.average}</p>
            </div>
            <hr className='my-2 w-full border border-neutral-200 dark:border-neutral-700' />
          </>
        ))}

      <button
        className='flex w-full items-center gap-2 text-sm text-gray-500 dark:text-gray-400 md:text-lg'
        onClick={() => setShowAll(!showAll)}
      >
        <p className='my-auto ml-auto text-base font-medium'>
          {showAll ? 'Show less' : 'Show all'}
        </p>
        {showAll ? (
          <IoIosArrowUp className='my-auto mr-auto font-extrabold' />
        ) : (
          <IoIosArrowDown className='my-auto mr-auto font-extrabold' />
        )}
      </button>

      <p className='mt-5 text-center text-sm text-gray-700 dark:text-gray-200'>
        Supported by{' '}
        <a href='https://demetrios-koziris.github.io/McGillEnhanced/'>
          <span className='underline'>McGill Enhanced</span>
        </a>
      </p>
    </div>
  );
};
