import { Link } from 'react-router-dom';

import { Course } from '../model/course';

type CourseReviewPromptProps = {
  course: Course;
};

export const CourseReviewPrompt = ({ course }: CourseReviewPromptProps) => {
  return (
    <div className='p-3 rounded-md bg-gray-50 mb-8'>
      <p>
        Taken this course?{' '}
        <Link
          className='px-3 py-2 ml-2 bg-red-500 hover:bg-red-400 transition duration-200 text-white rounded-md'
          to={`/review/${course._id}/add`}
        >
          Leave a review
        </Link>
      </p>
    </div>
  );
};
