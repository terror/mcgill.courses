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
      <div className='w-full py-32 flex flex-col items-center'>
        <h1 className='m-5 text-5xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
          Showing all courses
        </h1>
        <div className='mx-auto'>
          {courses.map((course) => (
            <div
              className='max-w-xl p-5 border rounded-lg m-2'
              key={course._id}
            >
              <div className='font-bold mb-2'>
                {course._id} - {course.title}
              </div>
              <div>{course.description}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};
