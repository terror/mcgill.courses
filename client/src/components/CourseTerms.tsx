import { useState } from 'react';
import { BsSun } from 'react-icons/bs';
import { FaLeaf, FaRegSnowflake } from 'react-icons/fa';

import {
  classNames,
  filterCurrentInstructors,
  uniqueTermInstructors,
} from '../lib/utils';
import { Course } from '../model/Course';
import { GoX } from 'react-icons/go';
import { Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';

const variantToSize = (variant: 'small' | 'large') => {
  return variant === 'small' ? 20 : 25;
};

const termToIcon = (term: string, variant: 'small' | 'large') => {
  type IconMap = { [key: string]: JSX.Element };
  const size = variantToSize(variant);

  const icons: IconMap = {
    fall: <FaLeaf size={size} color='Brown' />,
    winter: <FaRegSnowflake size={size} color='SkyBlue' />,
    summer: <BsSun size={size} color='Orange' />,
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

  if (course.terms.length === 0)
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
          to={`/instructor/${instructor.name
            .split(' ')
            .map((x) => x.toLowerCase())
            .join('-')}`}
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
