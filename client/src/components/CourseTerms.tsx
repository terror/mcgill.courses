import { BsSun } from 'react-icons/bs';
import { FaLeaf, FaRegSnowflake } from 'react-icons/fa';

import { classNames, uniqueTermInstructors } from '../lib/utils';
import { Course } from '../model/Course';
import { GoX } from 'react-icons/go';

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
  const instructors = uniqueTermInstructors(course);
  const terms = course.terms;
  const container = classNames('flex flex-wrap mr-auto');

  if (terms.length === 0)
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
        <div
          key={i}
          className={classNames(
            'my-2 ml-0 rounded-xl bg-gray-100 dark:bg-neutral-700',
            variant === 'small' ? 'mr-2 px-2 py-1' : 'mr-4 p-2'
          )}
        >
          <div className='flex items-center space-x-2'>
            {termToIcon(instructor.term, variant)}

            <div className='pr-1 dark:text-gray-200'>{instructor.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
