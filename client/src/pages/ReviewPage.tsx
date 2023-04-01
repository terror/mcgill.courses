import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { ReviewForm } from '../components/ReviewForm';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';

export const ReviewPage = () => {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course>();

  useEffect(() => {
    fetchClient.getData<Course>(`courses/${params.id}`).then((data) => {
      setCourse(data);
    });
  }, []);

  if (!course) {
    return <div></div>;
  }
  return (
    <Layout>
      <div className='flex justify-center'>
        <ReviewForm course={course} />
      </div>
    </Layout>
  );
};
