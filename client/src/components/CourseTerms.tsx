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
  return variant === 'small' ? 20 : 18;
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

const colorMap: Record<string, string> = {
  fall: 'bg-red-100 text-red-900',
  winter: 'bg-sky-100 text-sky-900',
  summer: 'bg-yellow-100 text-yellow-900',
};

type CourseTermsProps = {
  course: Course;
  variant: 'large' | 'small';
};

export const CourseTerms = ({ course, variant }: CourseTermsProps) => {
  const [hoveringOn, setHoveringOn] = useState('');

  const instructors = filterCurrentInstructors(uniqueTermInstructors(course));

  const currentlyOfferedTerms = course.terms.filter((c) =>
    getCurrentTerms().includes(c)
  );

  if (currentlyOfferedTerms.length === 0)
    return (
      <div className='w-fit text-sm'>
        <div className='rounded-xl bg-gray-200 p-1 dark:bg-neutral-700'>
          <div className='flex items-center space-x-1'>
            <GoX size={variantToSize(variant)} className='fill-gray-700' />
            <div className='pr-1 font-medium text-gray-800 dark:text-gray-200'>
              Not Offered
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className='mr-auto flex gap-x-2'>
      {instructors.map((instructor, i) => {
        const term = instructor.term.split(' ')[0].toLowerCase();
        return (
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
                'relative my-1.5 rounded-full text-sm dark:bg-neutral-700',
                variant === 'small' ? 'px-2 py-1' : 'max-w-fit p-1',
                colorMap[term]
              )}
            >
              <div className='flex items-center space-x-1.5 whitespace-nowrap'>
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
                <div className={twMerge('pr-1 font-medium dark:text-gray-200')}>
                  {instructor.name}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
