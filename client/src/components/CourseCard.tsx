import { Link } from 'react-router-dom';

import { Course } from '../model/Course';
import { CourseTerms } from './CourseTerms';

type CourseCardProps = {
  course: Course;
};

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Link to={`/course/${course._id}`} key={course._id}>
      <div className='max-w-xl p-5 border rounded-lg m-2'>
        <div className='font-bold mb-2'>
          {course._id} - {course.title}
        </div>
        <CourseTerms course={course} variant='small' />
        <div className='mt-4 text-gray-600'>{course.description}</div>
      </div>
    </Link>
  );
};
