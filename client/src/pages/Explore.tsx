import { useState, useEffect } from 'react';

import InfiniteScroll from 'react-infinite-scroll-component';
import { Course } from '../model/course';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/Spinner';
import { fetchClient } from '../lib/fetchClient';

export const Explore = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(20);

  useEffect(() => {
    fetchClient
      .getData<Course[]>('/courses?limit=20')
      .then((courses) =>
        setCourses(courses.filter((course) => course.title !== ''))
      )
      .catch((err) => console.log(err));
  }, []);

  const fetchMore = async () => {
    const batch = await fetchClient.getData<Course[]>(
      `/courses?limit=10&offset=${offset}`
    );
    if (batch.length === 0) setHasMore(false);
    setCourses(courses.concat(batch));
    setOffset(offset + 10);
  };

  return (
    <Layout>
      <div className='w-full py-32 flex flex-col items-center'>
        <h1 className='mb-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
          Showing all courses
        </h1>
        <InfiniteScroll
          dataLength={courses.length}
          hasMore={hasMore}
          loader={
            <div class='text-center mt-4'>
              <Spinner />
            </div>
          }
          next={fetchMore}
          style={{ overflowY: 'hidden' }}
        >
          <div className='mx-auto'>
            {courses.map((course) => (
              <Link to={`/course/${course._id}`} key={course._id}>
                <div className='max-w-xl p-5 border rounded-lg m-2'>
                  <div className='font-bold mb-2'>
                    {course._id} - {course.title}
                  </div>
                  <div>{course.description}</div>
                  {course.instructors.length !== 0 && (
                    <div className='mt-2'>
                      {course.instructors.map((instructor, index) => (
                        <span key={index}>
                          {instructor.name} ({instructor.term}){' '}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </Layout>
  );
};
