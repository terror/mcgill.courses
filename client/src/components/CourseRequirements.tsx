import { useCallback, useState } from 'react';
import { FiList } from 'react-icons/fi';
import { PiGraphFill } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import { capitalize, punctuate } from '../lib/utils';
import type { Course } from '../model/Course';
import type { Requirements } from '../model/Requirements';
import { CourseGraph } from './CourseGraph';

// Strips prefix strings like "Prerequisites: ..." and "Corequisites: ..."
const stripColonPrefix = (text: string): string => {
  const parts = text.split(' ');
  if (parts[0] && parts[0].endsWith(':')) {
    return parts.slice(1).join(' ');
  }
  return text;
};

const transformText = (text: string): React.ReactNode[] => {
  const nodes = [],
    regex = /\b([A-Z]{4})\s(\d{3})([A-Za-z]\d?)?\b/g;

  let lastIndex = 0;

  text.replace(regex, (match, code, number, level, index) => {
    if (index > lastIndex) nodes.push(text.substring(lastIndex, index));

    const courseLink = level
      ? `${code}-${number}${level}`
      : `${code}-${number}`;

    nodes.push(
      <Link
        key={`course-${index}`}
        to={`/course/${courseLink}`}
        className='text-gray-800 hover:underline dark:text-gray-200'
      >
        {`${code} ${number}${level ? level : ''}`}
      </Link>
    );

    lastIndex = index + match.length;

    return match;
  });

  if (lastIndex < text.length) nodes.push(text.substring(lastIndex));

  return nodes;
};

type RequirementBlockProps = {
  title: string;
  text?: string;
};

const RequirementBlock = ({ title, text }: RequirementBlockProps) => {
  return (
    <div>
      <h2 className='mb-2 mt-1 text-xl font-bold leading-none text-gray-700 dark:text-gray-200'>
        {title}
      </h2>
      {text ? (
        <div className='text-gray-500 dark:text-gray-400'>
          {transformText(capitalize(punctuate(stripColonPrefix(text.trim()))))}
        </div>
      ) : (
        <p className='text-gray-500 dark:text-gray-400'>
          This course has no {title.toLowerCase()}.
        </p>
      )}
    </div>
  );
};

type RequirementsProps = {
  course: Course;
  requirements: Requirements;
  className?: string;
};

export const CourseRequirements = ({
  course,
  requirements,
  className,
}: RequirementsProps) => {
  const [showGraph, setShowGraph] = useState(false);

  const handleGraphToggle = useCallback(
    () => setShowGraph((prev) => !prev),
    [setShowGraph]
  );

  const ToggleButtonIcon = showGraph ? FiList : PiGraphFill;

  return (
    <div
      className={twMerge(
        'relative w-full rounded-md bg-slate-50 shadow-sm dark:bg-neutral-800',
        className
      )}
    >
      <button
        className='absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-gray-200 p-1.5 transition duration-150 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600'
        onClick={handleGraphToggle}
      >
        <ToggleButtonIcon
          size={28}
          className='fill-gray-700 stroke-gray-700 dark:fill-gray-400 dark:stroke-gray-400'
        />
      </button>
      {!showGraph ? (
        <div className='space-y-7 p-6'>
          <RequirementBlock
            title='Prerequisites'
            text={requirements.prerequisitesText}
          />
          <RequirementBlock
            title='Corequisites'
            text={requirements.corequisitesText}
          />
          <RequirementBlock
            title='Restrictions'
            text={requirements.restrictions}
          />
        </div>
      ) : (
        <CourseGraph course={course} />
      )}
    </div>
  );
};
