import { BsSun } from 'react-icons/bs';
import { FaLeaf, FaRegSnowflake } from 'react-icons/fa';

import { classNames, uniqueTermInstructors } from '../lib/utils';
import { Course } from '../model/Course';

const termToIcon = (term: string, variant: 'small' | 'large') => {
  type IconMap = { [key: string]: JSX.Element };
  const size = variant === 'small' ? 20 : 25;

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

  return instructors.length !== 0 ? (
    <div
      className={classNames(
        'flex',
        variant === 'small' ? 'space-x-2' : 'space-x-3'
      )}
    >
      {instructors.map((i) => (
        <div
          className={classNames(
            'bg-gray-100 rounded-xl',
            variant === 'small' ? 'py-1 px-2' : 'p-2'
          )}
        >
          <div className='flex space-x-2 items-center'>
            {termToIcon(i.term, variant)}
            <div>{i.name}</div>
          </div>
        </div>
      ))}
    </div>
  ) : null;
};
