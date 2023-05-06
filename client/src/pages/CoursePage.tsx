import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AddReviewForm } from '../components/AddReviewForm';
import { Alert } from '../components/Alert';
import { CourseInfo } from '../components/CourseInfo';
import { CourseRequirements } from '../components/CourseRequirements';
import { CourseReview } from '../components/CourseReview';
import { CourseReviewPrompt } from '../components/CourseReviewPrompt';
import { EditReviewForm } from '../components/EditReviewForm';
import { Layout } from '../components/Layout';
import { NotFound } from '../components/NotFound';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/Course';
import { Requirements } from '../model/Requirements';
import { Review } from '../model/Review';

export const CoursePage = () => {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course>();
  const [reviews, setReviews] = useState<Review[]>();
  const user = useAuth();

  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [editReviewOpen, setEditReviewOpen] = useState(false);
  const [key, setKey] = useState(0);

  const [alertStatus, setAlertStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [alertMessage, setAlertMessage] = useState('');

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
    return (
      <Layout>
        <NotFound />
      </Layout>
    );
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

  const remountAlert = () => {
    setKey(key + 1);
  };

  const handleSubmit = (successMessage: string) => {
    return (res: Response) => {
      remountAlert();
      if (res.ok) {
        setAlertStatus('success');
        setAlertMessage(successMessage);
        setAddReviewOpen(false);
      } else {
        setAlertMessage('An error occurred.');
        setAlertStatus('error');
      }
    };
  };

  const handleDelete = async (review: Review) => {
    const res = await fetchClient.delete(
      '/reviews',
      { course_id: review.courseId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (res.ok) {
      setReviews(reviews.filter((r) => r.userId !== review.userId));
    }
    handleSubmit('Review deleted successfully.')(res);
    localStorage.removeItem(course._id);
  };

  const userReview = reviews.find((r) => r.userId === user?.id);
  const averageRating =
    reviews.map((review) => review.rating).reduce((a, b) => a + b, 0) /
    reviews.length;

  return (
    <Layout>
      <CourseInfo
        course={course}
        rating={averageRating}
        numReviews={reviews.length}
      />
      <div className='flex'>
        <div>
          <div className='ml-8 mt-8'>
            {canReview && (
              <CourseReviewPrompt
                openAddReview={() => setAddReviewOpen(true)}
              />
            )}
            <div>
              {userReview && (
                <CourseReview
                  review={userReview}
                  canModify={Boolean(user && userReview.userId === user.id)}
                  openEditReview={() => setEditReviewOpen(true)}
                  handleDelete={() => handleDelete(userReview)}
                />
              )}
              {reviews &&
                reviews
                  .filter((r) => user && r.userId !== user.id)
                  .map((r) => (
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
          handleSubmit={handleSubmit('Review added successfully.')}
        />
        {userReview && (
          <EditReviewForm
            course={course}
            open={editReviewOpen}
            onClose={() => setEditReviewOpen(false)}
            review={userReview}
            handleSubmit={handleSubmit('Review edited successfully.')}
          />
        )}
        <CourseRequirements requirements={requirements} />
      </div>
      {alertStatus && (
        <Alert status={alertStatus} key={key} message={alertMessage} />
      )}
    </Layout>
  );
};
