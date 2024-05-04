import { useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { Link } from 'react-router-dom';

import { compareTerms } from '../lib/utils';
import { Course } from '../model/Course';
import { Instructor } from '../model/Instructor';
import { TermAverage } from '../model/TermAverage';

const makeInstructorsMap = (instructors: Instructor[]) =>
  Object.fromEntries(instructors.map((i) => [i.term, i.name]));

type CourseAveragesProps = {
  course: Course;
  averages: TermAverage[];
};

export const CourseAverages = ({ course, averages }: CourseAveragesProps) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  const instructors = makeInstructorsMap(course.instructors);

  return (
    <div
      className={
        'relative w-full rounded-md bg-slate-50 p-5 shadow-sm dark:bg-neutral-800'
      }
    >
      <h2 className='mb-2 mt-1 text-lg font-bold leading-none text-gray-700 dark:text-gray-200 md:text-xl'>
        Class Averages
      </h2>
      <div className='py-1' />

      {/* <hr className='my-1 mt-2 w-full border border-neutral-200 dark:border-neutral-700' /> */}

      {averages
        .sort((a, b) => compareTerms(b.term, a.term))
        .slice(0, showAll ? averages.length : 6)
        .map((average) => {
          const instructor = instructors[average.term];
          return (
            <>
              <div className='flex items-center'>
                <p className='w-11/12 text-gray-500 dark:text-gray-400'>
                  <div>
                    <div className='mb-0.5 text-sm'>{average.term}</div>
                    <div className='text-xs'>
                      {instructor ? (
                        <Link
                          to={`/instructor/${encodeURIComponent(instructor ?? '')}`}
                          className='font-semibold hover:underline'
                        >
                          {instructors[average.term]}
                        </Link>
                      ) : (
                        <div>Instructor Unknown</div>
                      )}
                    </div>
                  </div>
                </p>
                <p className='font-medium text-gray-700 dark:text-gray-200'>
                  {average.average}
                </p>
              </div>
              <hr className='my-1 w-full border border-neutral-200 dark:border-neutral-700' />
            </>
          );
        })}

      <div className='py-1' />

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

      <p className='mt-5 text-center text-xs text-gray-700 dark:text-gray-200'>
        Supported by{' '}
        <a href='https://demetrios-koziris.github.io/McGillEnhanced/'>
          <span className='underline'>McGill Enhanced</span>
        </a>
      </p>
    </div>
  );
};
