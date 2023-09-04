import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AddReviewForm } from '../components/AddReviewForm';
import { Alert, AlertStatus } from '../components/Alert';
import { CourseInfo } from '../components/CourseInfo';
import { CourseRequirements } from '../components/CourseRequirements';
import { CourseReview } from '../components/CourseReview';
import { CourseReviewPrompt } from '../components/CourseReviewPrompt';
import { EditReviewForm } from '../components/EditReviewForm';
import { Layout } from '../components/Layout';
import { NotFound } from '../components/NotFound';
import { ReviewFilter } from '../components/ReviewFilter';
import { SchedulesDisplay } from '../components/SchedulesDisplay';
import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { getCurrentTerms } from '../lib/utils';
import { Course } from '../model/Course';
import { GetCourseWithReviewsPayload } from '../model/GetCourseWithReviewsPayload';
import { Requirements } from '../model/Requirements';
import { Review } from '../model/Review';
import { Loading } from './Loading';

export const CoursePage = () => {
  const params = useParams<{ id: string }>();

  const user = useAuth();
  const currentTerms = getCurrentTerms();

  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertStatus, setAlertStatus] = useState<AlertStatus | null>(null);
  const [allReviews, setAllReviews] = useState<Review[] | undefined>(undefined);
  const [course, setCourse] = useState<Course | null | undefined>(undefined);
  const [editReviewOpen, setEditReviewOpen] = useState(false);
  const [key, setKey] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showingReviews, setShowingReviews] = useState<Review[]>([]);

  useEffect(() => {
    const id = params.id?.replace('-', '').toUpperCase();
    fetchClient
      .getData<GetCourseWithReviewsPayload | null>(
        `/courses/${id}?with_reviews=true`
      )
      .then((payload) => {
        if (payload === null) {
          setCourse(null);
          return;
        }

        setCourse(payload.course);
        setShowingReviews(payload.reviews);
        setAllReviews(payload.reviews);
      })
      .catch((err) => console.log(err));
  }, [params.id, addReviewOpen, editReviewOpen]);

  if (course === null) {
    return (
      <Layout>
        <NotFound />
      </Layout>
    );
  }

  if (course === undefined || showingReviews === undefined) {
    return <Loading />;
  }

  if (course.terms.some((term) => !currentTerms.includes(term))) {
    setCourse({
      ...course,
      terms: course.terms.filter((term) => currentTerms.includes(term)),
    });
  }

  const requirements: Requirements = {
    prereqs: course.prerequisites,
    coreqs: course.corequisites,
    restrictions: course.restrictions,
    prerequisitesText: course.prerequisitesText,
    corequisitesText: course.corequisitesText,
  };

  const userReview = showingReviews?.find((r) => r.userId === user?.id);
  const canReview = Boolean(
    user && !allReviews?.find((r) => r.userId === user?.id)
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
      setShowingReviews(
        showingReviews.filter((r) => r.userId !== review.userId)
      );
      setAllReviews(
        allReviews?.filter(
          (r) => r.userId !== review.userId && r.courseId === review.courseId
        )
      );
    }

    handleSubmit('Review deleted successfully.')(res);

    localStorage.removeItem(course._id);
  };

  return (
    <Layout>
      <div className='mx-auto max-w-6xl'>
        <CourseInfo
          course={course}
          allReviews={allReviews ?? []}
          numReviews={allReviews?.length}
        />
        <div className='py-2' />
        <div className='hidden gap-x-6 lg:grid lg:grid-cols-5'>
          <div className='col-span-3'>
            <SchedulesDisplay course={course} />
            {canReview && (
              <>
                <div className='py-2' />
                <CourseReviewPrompt
                  openAddReview={() => setAddReviewOpen(true)}
                />
              </>
            )}
            <div className='py-2' />
            <div className='mb-2'>
              <ReviewFilter
                course={course}
                allReviews={allReviews ?? []}
                setReviews={setShowingReviews}
                setShowAllReviews={setShowAllReviews}
              />
            </div>
            <div className='w-full'>
              {userReview && (
                <CourseReview
                  canModify={Boolean(user && userReview.userId === user.id)}
                  handleDelete={() => handleDelete(userReview)}
                  openEditReview={() => setEditReviewOpen(true)}
                  review={userReview}
                />
              )}
              {showingReviews &&
                showingReviews
                  .filter((review) => (user ? review.userId !== user.id : true))
                  .slice(0, showAllReviews ? showingReviews.length : 8)
                  .map((review, i) => (
                    <CourseReview
                      canModify={Boolean(user && review.userId === user.id)}
                      handleDelete={() => handleDelete(review)}
                      key={i}
                      openEditReview={() => setEditReviewOpen(true)}
                      review={review}
                    />
                  ))}
            </div>
            {!showAllReviews && showingReviews.length > 8 && (
              <div className='flex justify-center text-gray-400 dark:text-neutral-500'>
                <button
                  className='h-full w-full border border-dashed border-neutral-400 py-2 dark:border-neutral-500'
                  onClick={() => setShowAllReviews(true)}
                >
                  Show all {showingReviews.length} reviews
                </button>
              </div>
            )}
          </div>
          <div className='col-span-2'>
            <CourseRequirements course={course} requirements={requirements} />
          </div>
        </div>
        <div className='py-1' />
        <div className='flex flex-col lg:hidden'>
          <div className='flex'>
            <CourseRequirements course={course} requirements={requirements} />
          </div>
          <div className='py-2.5' />
          <SchedulesDisplay course={course} />
          <div className='mt-4 flex w-full flex-row justify-between'>
            <div className='w-full'>
              {canReview && (
                <CourseReviewPrompt
                  openAddReview={() => setAddReviewOpen(true)}
                />
              )}
              <div className='my-2'>
                <ReviewFilter
                  course={course}
                  allReviews={allReviews ?? []}
                  setReviews={setShowingReviews}
                  setShowAllReviews={setShowAllReviews}
                />
              </div>
              <div className='w-full'>
                {userReview && (
                  <CourseReview
                    canModify={Boolean(user && userReview.userId === user.id)}
                    handleDelete={() => handleDelete(userReview)}
                    openEditReview={() => setEditReviewOpen(true)}
                    review={userReview}
                  />
                )}
                {showingReviews &&
                  showingReviews
                    .filter((review) =>
                      user ? review.userId !== user.id : true
                    )
                    .slice(0, showAllReviews ? showingReviews.length : 8)
                    .map((review, i) => (
                      <CourseReview
                        canModify={Boolean(user && review.userId === user.id)}
                        handleDelete={() => handleDelete(review)}
                        key={i}
                        openEditReview={() => setEditReviewOpen(true)}
                        review={review}
                      />
                    ))}
              </div>
              {!showAllReviews && showingReviews.length > 8 && (
                <div className='flex justify-center text-gray-400 dark:text-neutral-500'>
                  <button
                    className='h-full w-full border border-dashed border-neutral-400 py-2 dark:border-neutral-500'
                    onClick={() => setShowAllReviews(true)}
                  >
                    Show all {showingReviews.length} reviews
                  </button>
                </div>
              )}
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
        {alertStatus && (
          <Alert status={alertStatus} key={key} message={alertMessage} />
        )}
      </div>
    </Layout>
  );
};
