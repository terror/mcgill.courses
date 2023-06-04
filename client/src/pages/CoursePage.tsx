import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AddReviewForm } from '../components/AddReviewForm';
import { BoxToggle } from '../components/BoxToggle';
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
import { ReviewFilter } from '../components/ReviewFilter';
import { getCurrentTerms } from '../lib/utils';
import { SchedulesDisplay } from '../components/SchedulesDisplay';
import _ from 'lodash';
import { Instructor } from '../model/Instructor';

const sortBy = [
  { id: 1, name: 'Most Recent' },
  { id: 2, name: 'Least Recent' },
  { id: 3, name: 'Highest Rating' },
  { id: 4, name: 'Lowest Rating' },
  { id: 5, name: 'Hardest' },
  { id: 6, name: 'Easiest' },
];

export const CoursePage = () => {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course>();
  const [showingReviews, setShowingReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const user = useAuth();
  const currentTerms = getCurrentTerms();

  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [editReviewOpen, setEditReviewOpen] = useState(false);
  const [key, setKey] = useState(0);

  const [alertStatus, setAlertStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [alertMessage, setAlertMessage] = useState('');

  const [filterIsOpen, setFilterIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState({ id: 1, name: 'Most Recent' });
  const [filteredInstructors, setFilteredInstructors] = useState<string[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<number[]>([]);
  const [filteredDifficulties, setFilteredDifficulties] = useState<number[]>(
    []
  );

  useEffect(() => {
    fetchClient
      .getData<Course>(`/courses/${params.id?.toUpperCase()}`)
      .then((data) => setCourse(data))
      .catch((err) => console.log(err));
    fetchClient
      .getData<Review[]>(`/reviews?course_id=${params.id}`)
      .then((data) => {
        data = data.sort(
          (a, b) =>
            parseInt(b.timestamp.$date.$numberLong, 10) -
            parseInt(a.timestamp.$date.$numberLong, 10)
        );
        setShowingReviews(data);
        setAllReviews(data);
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
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Spinner />
        </div>
      </div>
    );
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
  };

  const canReview = Boolean(
    user && showingReviews.filter((r) => r.userId === user.id).length === 0
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
    }
    handleSubmit('Review deleted successfully.')(res);
    localStorage.removeItem(course._id);
  };

  const userReview = showingReviews.find((r) => r.userId === user?.id);
  const averageRating =
    _.sumBy(allReviews, (r) => r.rating) / showingReviews.length;

  return (
    <Layout>
      <CourseInfo
        course={course}
        rating={averageRating}
        numReviews={allReviews.length}
      />
      <SchedulesDisplay course={course} />
      <div className='flex flex-col md:flex-row'>
        <div className='mx-8 mt-4 flex md:hidden'>
          <CourseRequirements requirements={requirements} />
        </div>
        <div className='flex w-full flex-row justify-between'>
          <div className='my-4 ml-8 mr-8 w-full md:mr-4 md:mt-4'>
            {canReview && (
              <CourseReviewPrompt
                openAddReview={() => setAddReviewOpen(true)}
              />
            )}
            <div className='mb-5'>
              <BoxToggle
                title=''
                child={
                  <ReviewFilter
                    course={course}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    selectedInstructors={filteredInstructors}
                    setSelectedInstructors={setFilteredInstructors}
                    selectedRatings={filteredRatings}
                    setSelectedRatings={setFilteredRatings}
                    selectedDifficulties={filteredDifficulties}
                    setSelectedDifficulties={setFilteredDifficulties}
                    allReviews={allReviews}
                    setReviews={setShowingReviews}
                  />
                }
                isOpen={filterIsOpen}
                setIsOpen={setFilterIsOpen}
              />
            </div>
            <div className='w-full'>
              {userReview && (
                <CourseReview
                  canModify={Boolean(user && userReview.userId === user.id)}
                  handleDelete={() => handleDelete(userReview)}
                  isLast={showingReviews.length === 1}
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
                      isLast={i === showingReviews.length - 1}
                      key={i}
                      openEditReview={() => setEditReviewOpen(true)}
                      review={review}
                    />
                  ))}
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
        <div className='hidden h-fit w-5/12 md:flex md:flex-none'>
          <CourseRequirements requirements={requirements} />
        </div>
      </div>
      {alertStatus && (
        <Alert status={alertStatus} key={key} message={alertMessage} />
      )}
    </Layout>
  );
};
