import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AddReviewForm } from '../components/AddReviewForm';
import { Layout } from '../components/Layout';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';

export const AddReviewPage = () => {
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
        <AddReviewForm course={course} />
      </div>
    </Layout>
  );
};
