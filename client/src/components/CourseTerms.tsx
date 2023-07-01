import {
  classNames,
  filterCurrentInstructors,
  uniqueTermInstructors,
  getCurrentTerms,
} from '../lib/utils';

import { BsSun } from 'react-icons/bs';
import { Course } from '../model/Course';
import { FaLeaf, FaRegSnowflake } from 'react-icons/fa';
import { GoX } from 'react-icons/go';
import { Link } from 'react-router-dom';
import { Transition } from '@headlessui/react';
import { useState } from 'react';

const variantToSize = (variant: 'small' | 'large') => {
  return variant === 'small' ? 20 : 25;
};

const termToIcon = (term: string, variant: 'small' | 'large') => {
  type IconMap = { [key: string]: JSX.Element };
  const size = variantToSize(variant);

  const icons: IconMap = {
    fall: <FaLeaf size={size} color='brown' />,
    winter: <FaRegSnowflake size={size} color='skyblue' />,
    summer: <BsSun size={size} color='orange' />,
  };

  return icons[term.split(' ')[0].toLowerCase()];
};

type CourseTermsProps = {
  course: Course;
  variant: 'large' | 'small';
};

const ToolTip = ({ term }: { term: string }) => {
  return (
    <div className='absolute	 -top-1 left-0 z-10 w-28 -translate-x-0 -translate-y-full transform rounded-lg bg-white p-2 text-center text-xs font-bold text-gray-700 dark:bg-neutral-500 dark:text-gray-100'>
      {term}
    </div>
  );
};

export const CourseTerms = ({ course, variant }: CourseTermsProps) => {
  const [hoveringOn, setHoveringOn] = useState('');

  const container = classNames('flex flex-wrap mr-auto');
  const instructors = filterCurrentInstructors(uniqueTermInstructors(course));
  const currentlyOfferedTerms = course.terms.filter((c) =>
    getCurrentTerms().includes(c)
  );

  if (currentlyOfferedTerms.length === 0)
    return (
      <div className={container}>
        <div
          className={classNames(
            'rounded-xl bg-gray-100 dark:bg-neutral-700',
            variant === 'small' ? 'px-2 py-1' : 'p-2'
          )}
        >
          <div className='flex items-center space-x-2'>
            <GoX size={variantToSize(variant)} color='DarkGray' />
            <div className='pr-1 dark:text-gray-200'>Not Offered</div>
          </div>
        </div>
      </div>
    );

  return (
    <div className={container}>
      {instructors.map((instructor, i) => (
        <Link
          key={i}
          className={classNames(
            instructor.name === 'No Instructor Assigned'
              ? 'pointer-events-none'
              : ''
          )}
          to={`/instructor/${encodeURIComponent(instructor.name)}`}
        >
          <div
            key={i}
            className={classNames(
              'relative my-2 ml-0 rounded-xl bg-gray-100 dark:bg-neutral-700',
              variant === 'small' ? 'mr-2 px-2 py-1' : 'mr-4 max-w-fit p-2'
            )}
          >
            <div className='flex items-center space-x-2'>
              {variant === 'large' ? (
                <div
                  onMouseEnter={() => setHoveringOn(instructor.term)}
                  onMouseLeave={() => setHoveringOn('')}
                >
                  {termToIcon(instructor.term, variant)}
                </div>
              ) : (
                <div>{termToIcon(instructor.term, variant)}</div>
              )}
              <div className='pr-1 text-gray-700 dark:text-gray-200'>
                {instructor.name}
              </div>
            </div>
            <Transition
              show={hoveringOn === instructor.term}
              enter='transition-opacity duration-200'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='transition-opacity duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <div>
                <ToolTip term={instructor.term} />
              </div>
            </Transition>
          </div>
        </Link>
      ))}
    </div>
  );
};
