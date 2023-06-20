import { useState } from 'react';
import { BsSun } from 'react-icons/bs';
import { FaLeaf, FaRegSnowflake } from 'react-icons/fa';
import { GoX } from 'react-icons/go';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import {
  filterCurrentInstructors,
  getCurrentTerms,
  uniqueTermInstructors,
} from '../lib/utils';
import { Course } from '../model/Course';
import { Tooltip } from './Tooltip';

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

export const CourseTerms = ({ course, variant }: CourseTermsProps) => {
  const [hoveringOn, setHoveringOn] = useState('');

  const container = twMerge('flex flex-wrap mr-auto');
  const instructors = filterCurrentInstructors(uniqueTermInstructors(course));
  const currentlyOfferedTerms = course.terms.filter((c) =>
    getCurrentTerms().includes(c)
  );

  if (currentlyOfferedTerms.length === 0)
    return (
      <div className={container}>
        <div
          className={twMerge(
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
          className={twMerge(
            instructor.name === 'No Instructor Assigned'
              ? 'pointer-events-none'
              : ''
          )}
          to={`/instructor/${encodeURIComponent(instructor.name)}`}
        >
          <div
            key={i}
            className={twMerge(
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
                  <Tooltip
                    show={hoveringOn === instructor.term}
                    text={instructor.term}
                  >
                    <div>{termToIcon(instructor.term, variant)}</div>
                  </Tooltip>
                </div>
              ) : (
                <div>{termToIcon(instructor.term, variant)}</div>
              )}
              <div className='pr-1 text-gray-700 dark:text-gray-200'>
                {instructor.name}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
