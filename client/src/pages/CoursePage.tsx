import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CourseInfo } from '../components/CourseInfo';
import { CourseRequirements } from '../components/CourseRequirements';
import { CourseReview } from '../components/CourseReview';
import { Layout } from '../components/Layout';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';
import { Requirements } from '../model/requirements';
import { Review } from '../model/review';

export const CoursePage = () => {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course>();

  useEffect(() => {
    fetchClient
      .getData<Course>(`/courses/${params.id?.toUpperCase()}`)
      .then((data) => setCourse(data))
      .catch((err) => console.log(err));
  }, []);

  if (course === null) {
    return <div>404 not found</div>; // TODO: 404 component
  }

  if (course === undefined) {
    return <div>Loading...</div>; //TODO: some spinning comonent
  }

  const review: Review = {
    courseId: 'MATH240',
    instructor: 'Adrian Roshan Vetta',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' +
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' +
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' +
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    userId: 'test',
    rating: 4,
  };

  const requirements: Requirements = {
    prereqs: course.prerequisites,
    coreqs: course.corequisites,
    restrictions: course.restrictions,
  };

  return (
    <Layout>
      <CourseInfo course={course} />
      <CourseRequirements requirements={requirements} />
      <CourseReview review={review} />
    </Layout>
  );
};
