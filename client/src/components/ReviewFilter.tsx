import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import { Course } from '../model/Course';
import { Review } from '../model/Review';
import { Autocomplete } from './Autocomplete';
import { Disclosure } from '@headlessui/react';
import { LuChevronDown } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';
import { ResetButton } from './ResetButton';

const sortTypes = [
  'Most Recent',
  'Least Recent',
  'Highest Rating',
  'Lowest Rating',
  'Hardest',
  'Easiest',
] as const;

export type ReviewSortType = (typeof sortTypes)[number];

type ReviewFilterProps = {
  course: Course;
  allReviews: Review[];
  setReviews: Dispatch<SetStateAction<Review[]>>;
  setShowAllReviews: Dispatch<SetStateAction<boolean>>;
};

export const ReviewFilter = ({
  course,
  allReviews,
  setReviews,
  setShowAllReviews,
}: ReviewFilterProps) => {
  const [sortBy, setSortBy] = useState<ReviewSortType>('Most Recent');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');

  useEffect(() => {
    setReviews(
      allReviews
        .filter(
          (review: Review) =>
            selectedInstructor === '' ||
            review.instructors
              .map((ins) => ins.toLowerCase())
              .includes(selectedInstructor.toLowerCase())
        )
        .sort((a: Review, b: Review) => {
          switch (sortBy) {
            case 'Most Recent':
              return (
                parseInt(b.timestamp.$date.$numberLong, 10) -
                parseInt(a.timestamp.$date.$numberLong, 10)
              );
            case 'Least Recent':
              return (
                parseInt(a.timestamp.$date.$numberLong, 10) -
                parseInt(b.timestamp.$date.$numberLong, 10)
              );
            case 'Highest Rating':
              return b.rating - a.rating;
            case 'Lowest Rating':
              return a.rating - b.rating;
            case 'Hardest':
              return b.difficulty - a.difficulty;
            case 'Easiest':
              return a.difficulty - b.difficulty;
            default:
              return (
                parseInt(b.timestamp.$date.$numberLong, 10) -
                parseInt(a.timestamp.$date.$numberLong, 10)
              );
          }
        })
    );
    setShowAllReviews(false);
  }, [sortBy, selectedInstructor]);

  const reset = () => {
    setSortBy('Most Recent');
    setSelectedInstructor('');
  };

  useEffect(reset, [course]);

  const sorts = useMemo(() => sortTypes.slice(), []);
  const uniqueInstructors = _.uniq(course.instructors.map((ins) => ins.name));

  return (
    <div className='flex flex-col rounded-lg dark:bg-neutral-900 dark:text-gray-200'>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button>
              <div className='flex w-full justify-between rounded-lg bg-slate-200 px-4 py-2 text-red-500 dark:bg-neutral-700'>
                <h1 className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Filter...
                </h1>
                <LuChevronDown
                  className={twMerge(
                    open ? 'rotate-180 transform' : '',
                    'h-5 w-5 text-gray-500'
                  )}
                />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className='relative'>
              <div className='py-2' />
              <div className='p-1'>
                <div className='flex gap-x-2'>
                  <div className='w-2/5'>
                    <h2 className='mb-2 text-sm font-medium text-gray-600 dark:text-gray-400'>
                      Sort By
                    </h2>
                    <div className='relative z-10'>
                      <Autocomplete
                        options={sorts}
                        value={sortBy}
                        setValue={(val: string) =>
                          setSortBy(val as ReviewSortType)
                        }
                      />
                    </div>
                  </div>
                  <div className='w-3/5'>
                    <h2 className='mb-2 text-sm font-medium text-gray-600 dark:text-gray-400'>
                      Instructor
                    </h2>
                    <div className='relative z-10'>
                      <Autocomplete
                        options={uniqueInstructors}
                        value={selectedInstructor}
                        setValue={setSelectedInstructor}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <ResetButton
                className='absolute right-2 top-2 ml-auto'
                onClear={reset}
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};
