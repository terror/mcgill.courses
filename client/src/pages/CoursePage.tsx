import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { CourseInfo } from '../components/CourseInfo';
import { CourseRequirements } from '../components/CourseRequirements';
import { CourseReview } from '../components/CourseReview';
import { CourseReviewPrompt } from '../components/CourseReviewPrompt';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/Course';
import { Requirements } from '../model/Requirements';
import { Review } from '../model/Review';
import { AddReviewForm } from '../components/AddReviewForm';
import { EditReviewForm } from '../components/EditReviewForm';

export const CoursePage = () => {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course>();
  const [reviews, setReviews] = useState<Review[]>();
  const user = useAuth();

  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [editReviewOpen, setEditReviewOpen] = useState(false);

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
  }, [params.id, addReviewOpen, editReviewOpen]);

  if (course === null) {
    return <div>404 not found</div>;
  }

  if (course === undefined || reviews === undefined) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Spinner />
        </div>
      </div>
    );
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

  const userReview = reviews.find((r) => r.userId === user?.id);

  return (
    <Layout>
      <CourseInfo course={course} />
      <div className='flex'>
        <div>
          <div className='mt-8 ml-8'>
            {canReview && (
              <CourseReviewPrompt
                course={course}
                openAddReview={() => setAddReviewOpen(true)}
              />
            )}
            <div>
              {reviews &&
                reviews.map((r) => (
                  <CourseReview
                    review={r}
                    canModify={Boolean(user && r.userId === user.id)}
                    openEditReview={() => setEditReviewOpen(true)}
                    handleDelete={() => handleDelete(r)}
                  />
                ))}
            </div>
          </div>
        </div>
        <AddReviewForm
          course={course}
          open={addReviewOpen}
          onClose={() => setAddReviewOpen(false)}
        />
        {userReview && (
          <EditReviewForm
            course={course}
            open={editReviewOpen}
            onClose={() => setEditReviewOpen(false)}
            review={userReview}
          />
        )}
        <CourseRequirements requirements={requirements} />
      </div>
    </Layout>
  );
};
