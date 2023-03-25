import { useState, useEffect } from 'react';

import { Course } from '../model/course';
import { Layout } from '../components/Layout';
import { fetchClient } from '../lib/fetchClient';

export const Explore = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchClient
      .getData<Course[]>('/courses')
      .then((courses) =>
        setCourses(courses.filter((course) => course.title !== ''))
      )
      .catch((err) => console.log(err));
  }, []);

  return (
    <Layout>
      <div className='max-w-xl py-32 sm:py-20 lg:py-56'>
        <h1 className='m-5 text-5xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
          Showing all courses
        </h1>
        {courses.map((course) => (
          <div className='p-2 border rounded-lg m-2' key={course._id}>
            <div className='font-bold'>
              {course._id} - {course.title}
            </div>
            <div>{course.description}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
};
