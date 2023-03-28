import { useParams } from 'react-router-dom';
import { CourseReview } from '../components/CourseReview';
import { Layout } from '../components/Layout';
import { Course } from '../model/course';
import { Review } from '../model/review';

export const CoursePage = () => {
  const params = useParams<{ id: string }>();
  const review: Review = {
    course: 'MATH 240',
    instructor: 'Adrian Roshan Vetta',
    term: 'Fall 2022',
    text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' +
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' +
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' +
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    difficultyRating: 6,
    usefulRating: 8,
    interestingRating: 9,
  };

  return (
    <Layout>
      <CourseReview review={review} />
    </Layout>
  );
};
