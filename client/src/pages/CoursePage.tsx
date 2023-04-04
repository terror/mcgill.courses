import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { CourseInfo } from '../components/CourseInfo';
import { CourseRequirements } from '../components/CourseRequirements';
import { CourseReview } from '../components/CourseReview';
import { CourseReviewPrompt } from '../components/CourseReviewPrompt';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';
import { Requirements } from '../model/requirements';
import { Review } from '../model/review';

export const CoursePage = () => {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course>();
  const [reviews, setReviews] = useState<Review[]>();
  const user = useAuth();

  useEffect(() => {
    fetchClient
      .getData<Course>(`/courses/${params.id?.toUpperCase()}`)
      .then((data) => setCourse(data))
      .catch((err) => console.log(err));
    fetchClient
      .getData<Review[]>(`/reviews?course_id=${params.id}`)
      .then((data) => {
        setReviews(data);
      });
  }, [params.id]);

  if (course === null) {
    return <div>404 not found</div>;
  }

  if (course === undefined || reviews === undefined) {
    return <div>Loading...</div>; // TODO: some spinning comonent
  }

  const requirements: Requirements = {
    prereqs: course.prerequisites,
    coreqs: course.corequisites,
    restrictions: course.restrictions,
  };

  const canReview = Boolean(
    user && reviews.filter((r) => r.userId === user.id).length === 0
  );

  const handleDelete = async (review: Review) => {
    await fetchClient.delete(
      '/reviews',
      { course_id: review.courseId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    setReviews(reviews.filter((r) => r.userId !== review.userId));
  };

  return (
    <Layout>
      <CourseInfo course={course} />
      <div className='flex'>
        <div>
          <div className='mt-8 ml-8'>
            {canReview && <CourseReviewPrompt course={course} />}
            <div>
              {reviews &&
                reviews.map((r) => (
                  <CourseReview
                    review={r}
                    canModify={Boolean(user && r.userId === user.id)}
                    handleDelete={() => handleDelete(r)}
                  />
                ))}
            </div>
          </div>
        </div>
        <CourseRequirements requirements={requirements} />
      </div>
    </Layout>
  );
};
