import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';

import type { Review } from '../lib/types';
import type { Course } from '../model/course';
import { Autocomplete } from './autocomplete';
import { ResetButton } from './reset-button';

const sortTypes = [
  'Most Recent',
  'Least Recent',
  'Highest Rating',
  'Lowest Rating',
  'Hardest',
  'Easiest',
  'Most Liked',
  'Most Disliked',
] as const;

export type ReviewSortType = (typeof sortTypes)[number];

type ReviewFilterProps = {
  course: Course;
  allReviews: Review[];
  sortBy: ReviewSortType;
  selectedInstructor: string;
  setShowAllReviews: Dispatch<SetStateAction<boolean>>;
  setSelectedInstructor: Dispatch<SetStateAction<string>>;
  setSortBy: Dispatch<SetStateAction<ReviewSortType>>;
};

export const ReviewFilter = ({
  course,
  sortBy,
  selectedInstructor,
  setShowAllReviews,
  setSortBy,
  setSelectedInstructor,
}: ReviewFilterProps) => {
  useEffect(() => {
    setShowAllReviews(false);
  }, [sortBy, selectedInstructor, setShowAllReviews]);

  const reset = () => {
    setSortBy('Most Recent');
    setSelectedInstructor('');
  };

  useEffect(reset, [course]);

  const sorts = useMemo(() => sortTypes.slice(), []);
  const uniqueInstructors = _.uniq(course.instructors.map((ins) => ins.name));

  return (
    <div className='rounded-lg dark:bg-neutral-900 dark:text-gray-200'>
      <div className='relative mt-6 xs:mt-0 xs:flex xs:items-center'>
        <div className='p-1'>
          <div className='flex max-w-sm gap-x-2'>
            <div className='w-2/5 xs:max-w-56'>
              <h2 className='mb-2 text-sm font-medium text-gray-600 dark:text-gray-400'>
                Sort By
              </h2>
              <div className='relative z-10'>
                <Autocomplete
                  options={sorts}
                  value={sortBy}
                  setValue={(val: string) => setSortBy(val as ReviewSortType)}
                />
              </div>
            </div>
            <div className='w-3/5 xs:w-auto'>
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
          className='absolute -top-2 right-2 xs:static xs:mt-6 '
          onClear={reset}
        />
      </div>
    </div>
  );
};
