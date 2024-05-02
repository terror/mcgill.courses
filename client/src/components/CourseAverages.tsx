import { compareTerms } from '../lib/utils';
import { TermAverage } from '../model/TermAverage';

type CourseAveragesProps = {
  averages: TermAverage[];
};

export const CourseAverages = ({ averages }: CourseAveragesProps) => {
  return (
    <div
      className={
        'relative w-full rounded-md bg-slate-50 p-5 shadow-sm dark:bg-neutral-800'
      }
    >
      <h2 className='mb-2 mt-1 text-xl font-bold leading-none text-gray-700 dark:text-gray-200'>
        Class Averages
      </h2>

      <hr className='my-2 mt-5 w-full border border-neutral-200 dark:border-neutral-700' />

      {averages
        .sort((a, b) => compareTerms(a.term, b.term))
        .reverse()
        .map((average) => (
          <>
            <div className='flex flex-row '>
              <p className='w-11/12 text-lg text-gray-500 dark:text-gray-400'>
                {average.term}
              </p>
              <p className='text-lg text-gray-500 dark:text-gray-400'>
                {average.average}
              </p>
            </div>
            <hr className='my-2 w-full border border-neutral-200 dark:border-neutral-700' />
          </>
        ))}

      <p className='mt-5 text-center text-sm text-gray-700 dark:text-gray-200'>
        Supported by{' '}
        <a href='https://demetrios-koziris.github.io/McGillEnhanced/'>
          <span className='underline'>McGill Enhanced</span>
        </a>
      </p>
    </div>
  );
};
