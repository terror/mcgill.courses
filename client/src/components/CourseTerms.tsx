import { produce } from 'immer';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'react-feather';
import { BsSun } from 'react-icons/bs';
import { FaLeaf, FaRegSnowflake } from 'react-icons/fa';
import { GoX } from 'react-icons/go';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import {
  getCurrentTerms,
  groupCurrentCourseTermInstructors,
} from '../lib/utils';
import type { Course } from '../model/Course';
import { Highlight } from './Highlight';
import { Tooltip } from './Tooltip';

const variantToSize = (variant: 'small' | 'large') => {
  return variant === 'small' ? 20 : 18;
};

const seasonToIcon = (season: string, variant: 'small' | 'large') => {
  type IconMap = { [key: string]: JSX.Element };
  const size = variantToSize(variant);

  const icons: IconMap = {
    fall: <FaLeaf size={size} color='brown' />,
    winter: <FaRegSnowflake size={size} color='skyblue' />,
    summer: <BsSun size={size} color='orange' />,
  };

  return icons[season.split(' ')[0].toLowerCase()];
};

export const termColorMap: Record<string, string> = {
  fall: 'bg-red-100 text-red-900',
  winter: 'bg-sky-100 text-sky-900',
  summer: 'bg-yellow-100 text-yellow-900',
};

type CourseTermsProps = {
  course: Course;
  variant: 'large' | 'small';
  query?: string;
};

export const CourseTerms = ({ course, variant, query }: CourseTermsProps) => {
  const instructorGroups = groupCurrentCourseTermInstructors(course);

  const initialExpandedState = () => instructorGroups.map(() => false);

  const [expandedState, setExpandedState] = useState(initialExpandedState());

  const handleToggle = (i: number) => {
    setExpandedState(
      produce(expandedState, (draft) => {
        draft[i] = !draft[i];
      })
    );
  };

  useEffect(() => {
    setExpandedState(initialExpandedState());
  }, [course]);

  const currentlyOfferedTerms = course.terms.filter((c) =>
    getCurrentTerms().includes(c)
  );

  if (currentlyOfferedTerms.length === 0)
    return (
      <div className='my-1.5 w-fit text-sm'>
        <div className='rounded-xl bg-gray-200 p-1 dark:bg-neutral-700'>
          <div className='flex items-center space-x-1'>
            <GoX
              size={variantToSize(variant)}
              className='fill-gray-700 dark:fill-gray-200'
            />
            <div className='pr-1 font-medium text-gray-800 dark:text-gray-200'>
              Not Offered
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className='mr-auto flex flex-wrap gap-x-2'>
      {instructorGroups.map(([term, instructors], i) => {
        const season = term.split(' ')[0].toLowerCase();
        return (
          <div className='relative' key={term}>
            <div
              className={twMerge(
                'my-1.5 flex text-sm dark:bg-neutral-700',
                variant === 'small' ? 'px-2 py-1' : 'max-w-fit px-2 py-1',
                termColorMap[season],
                expandedState[i] ? 'rounded-xl' : 'rounded-full'
              )}
            >
              <div className={twMerge('flex flex-col gap-y-1')}>
                {(expandedState[i] ? instructors : instructors.slice(0, 1)).map(
                  (ins) => (
                    <Link
                      key={ins.name}
                      className={twMerge(
                        instructors.length === 0 ? 'pointer-events-none' : ''
                      )}
                      to={`/instructor/${encodeURIComponent(ins.name)}`}
                    >
                      <div className='flex items-center space-x-1.5 whitespace-nowrap'>
                        {variant === 'large' ? (
                          <Tooltip text={term}>
                            <div>{seasonToIcon(season, variant)}</div>
                          </Tooltip>
                        ) : (
                          <div>{seasonToIcon(season, variant)}</div>
                        )}
                        <div
                          className={twMerge(
                            'pr-1 font-medium dark:text-gray-200'
                          )}
                        >
                          <Highlight
                            text={ins.name}
                            query={query || undefined}
                          />
                        </div>
                      </div>
                    </Link>
                  )
                )}
              </div>
              {instructors.length > 1 && (
                <span
                  className='cursor-pointer font-semibold dark:text-gray-200'
                  onClick={() => handleToggle(i)}
                >
                  +{instructors.length - 1}
                  <ChevronDown
                    className={twMerge(
                      'inline-block',
                      expandedState[i] ? 'rotate-180' : 'rotate-0'
                    )}
                    size={16}
                  />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
