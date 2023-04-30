import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Alert } from '../components/Alert';
import { CourseCard } from '../components/CourseCard';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/Course';

export const Explore = () => {
  const limit = 20;

  const [courses, setCourses] = useState<Course[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(limit);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchClient
      .getData<Course[]>(`/courses?limit=${limit}`)
      .then((data) => setCourses(data))
      .catch((_) => setError(true));
  }, []);

  const fetchMore = async () => {
    const batch = await fetchClient.getData<Course[]>(
      `/courses?limit=${limit}&offset=${offset}`
    );

    if (batch.length === 0) setHasMore(false);
    else {
      setCourses(courses.concat(batch));
      setOffset(offset + limit);
    }
  };

  return (
    <Layout>
      {error ? <Alert status='error' /> : null}
      <div className='flex w-full flex-col items-center py-8'>
        <h1 className='mb-4 text-center text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-200 sm:text-5xl'>
          Showing all courses
        </h1>
        <InfiniteScroll
          dataLength={courses.length}
          hasMore={hasMore}
          loader={
            <div className='mt-4 text-center'>
              <Spinner />
            </div>
          }
          next={fetchMore}
          style={{ overflowY: 'hidden' }}
        >
          <div className='mx-auto'>
            {courses.map((course, i) => (
              <CourseCard key={i} course={course} />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </Layout>
  );
};
