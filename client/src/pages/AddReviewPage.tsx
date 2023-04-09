import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { AddReviewForm } from '../components/AddReviewForm';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';
import { Review } from '../model/review';

export const AddReviewPage = () => {
  const user = useAuth();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course>();
  const [review, setReview] = useState<Review>();

  useEffect(() => {
    fetchClient.getData<Course>(`courses/${params.id}`).then((data) => {
      setCourse(data);
      fetchClient.getData<Review>(`reviews/${data._id}`).then((rev) => {
        setReview(rev);
      });
    });
  }, []);

  if (!course || review === undefined) return <div></div>;

  if (review) return <Navigate to={`/review/${course._id}/edit`} />;

  return (
    <Layout>
      <div className='flex justify-center'>
        <AddReviewForm course={course} />
      </div>
    </Layout>
  );
};
