import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { EditReviewForm } from '../components/EditReviewForm';
import { Layout } from '../components/Layout';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/Course';
import { Review } from '../model/Review';

export const EditReviewPage = () => {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course>();
  const [review, setReview] = useState<Review>();

  useEffect(() => {
    fetchClient.getData<Course>(`courses/${params.id}`).then((data) => {
      setCourse(data);
    });
    fetchClient
      .getData<Review>(`reviews/${params.id}`, { credentials: 'include' })
      .then((data) => {
        setReview(data);
      });
  }, []);

  if (!course || !review) {
    return <div></div>;
  }

  return (
    <Layout>
      <div className='flex justify-center'>
        <EditReviewForm course={course} review={review} />
      </div>
    </Layout>
  );
};
