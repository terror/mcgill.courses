import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

import courseAverageData from '../assets/courseAveragesData.json';
import { AddReviewForm } from '../components/add-review-form';
import { CourseAverages } from '../components/course-averages';
import { CourseInfo } from '../components/course-info';
import { CourseRequirements } from '../components/course-requirements';
import { CourseReview } from '../components/course-review';
import { CourseReviewPrompt } from '../components/course-review-prompt';
import { EditReviewForm } from '../components/edit-review-form';
import { Layout } from '../components/layout';
import { NotFound } from '../components/not-found';
import { ReviewEmptyPrompt } from '../components/review-empty-prompt';
import { ReviewFilter, ReviewSortType } from '../components/review-filter';
import { SchedulesDisplay } from '../components/schedules-display';
import {
  useCourseInteractions,
  useCourseWithReviews,
  useDeleteReview,
} from '../hooks/api';
import { useAuth } from '../hooks/use-auth';
import type { Review } from '../lib/types';
import { getCurrentTerms } from '../lib/utils';
import type { Requirements } from '../model/requirements';
import { TermAverage } from '../model/term-average';
import { Loading } from './loading';

export const CoursePage = () => {
  const params = useParams<{ id: string }>();
  const courseId = params.id?.replace('-', '').toUpperCase();

  const user = useAuth();
  const currentTerms = getCurrentTerms();

  const [addReviewOpen, setAddReviewOpen] = useState(false);
  const [editReviewOpen, setEditReviewOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showingReviews, setShowingReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<ReviewSortType>('Most Recent');
  const [selectedInstructor, setSelectedInstructor] = useState('');

  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useCourseWithReviews(courseId);

  const { data: interactionsData } = useCourseInteractions(
    courseId || '',
    user?.id || ''
  );

  const deleteReviewMutation = useDeleteReview();

  const course = courseData?.course;
  const allReviews = courseData?.reviews;
  const userInteractions = interactionsData?.interactions || [];

  if (courseError || courseData === null) {
    return (
      <Layout>
        <NotFound />
      </Layout>
    );
  }

  if (courseLoading || !course || !allReviews) {
    return <Loading />;
  }

  const filteredCourse = useMemo(
    () => ({
      ...course,
      terms: course.terms.filter((term) => currentTerms.includes(term)),
    }),
    [course, currentTerms]
  );

  const requirements: Requirements = {
    prereqs: filteredCourse.prerequisites,
    coreqs: filteredCourse.corequisites,
    restrictions: filteredCourse.restrictions,
    prerequisitesText: filteredCourse.prerequisitesText,
    corequisitesText: filteredCourse.corequisitesText,
  };

  const userReview = showingReviews?.find((r) => r.userId === user?.id);

  const canReview = Boolean(
    user && !allReviews?.find((r) => r.userId === user?.id)
  );

  const allCourseAverages: Record<string, TermAverage[]> =
    courseAverageData as Record<string, TermAverage[]>;

  const courseAverages: TermAverage[] = allCourseAverages[filteredCourse._id];

  const handleDelete = (review: Review) => {
    deleteReviewMutation.mutate(review.courseId);
    localStorage.removeItem(filteredCourse._id);
  };

  return (
    <Layout>
      <Helmet>
        <title>
          {filteredCourse._id} - {filteredCourse.title} - mcgill.courses
        </title>
        <meta name='description' content={filteredCourse.description} />

        <meta property='og:type' content='website' />
        <meta
          property='og:url'
          content={`https://mcgill.courses/${filteredCourse._id}`}
        />
        <meta
          property='og:title'
          content={`${filteredCourse._id}- ${filteredCourse.title} - mcgill.courses`}
        />
        <meta property='og:description' content={filteredCourse.description} />

        <meta
          property='twitter:url'
          content={`https://mcgill.courses/${filteredCourse._id}`}
        />
        <meta
          property='twitter:title'
          content={`${filteredCourse._id}- ${filteredCourse.title} - mcgill.courses`}
        />
        <meta
          property='twitter:description'
          content={filteredCourse.description}
        />
      </Helmet>

      <div className='mx-auto mt-10 max-w-6xl md:mt-0'>
        <CourseInfo
          course={filteredCourse}
          allReviews={showingReviews}
          numReviews={showingReviews.length}
        />
        <div className='py-2.5' />
        <div className='hidden gap-x-6 lg:grid lg:grid-cols-5'>
          <div className='col-span-3'>
            <SchedulesDisplay
              course={filteredCourse}
              className={canReview ? 'mb-4' : ''}
            />
            {canReview && (
              <CourseReviewPrompt
                openAddReview={() => setAddReviewOpen(true)}
              />
            )}
            <div className='py-2' />
            {allReviews && allReviews.length > 0 ? (
              <div className='mb-2'>
                <ReviewFilter
                  course={filteredCourse}
                  allReviews={allReviews ?? []}
                  setReviews={setShowingReviews}
                  setShowAllReviews={setShowAllReviews}
                  sortBy={sortBy}
                  selectedInstructor={selectedInstructor}
                  setSortBy={setSortBy}
                  setSelectedInstructor={setSelectedInstructor}
                />
              </div>
            ) : (
              <ReviewEmptyPrompt className='my-8'>
                No reviews have been left for this course yet, be the first!
              </ReviewEmptyPrompt>
            )}
            <div className='w-full shadow-sm'>
              {userReview && (
                <CourseReview
                  canModify={Boolean(user && userReview.userId === user.id)}
                  handleDelete={() => handleDelete(userReview)}
                  openEditReview={() => setEditReviewOpen(true)}
                  review={userReview}
                  interactions={userInteractions}
                />
              )}
              {showingReviews.length > 0
                ? showingReviews
                    .filter((review) =>
                      user ? review.userId !== user.id : true
                    )
                    .slice(0, showAllReviews ? showingReviews.length : 8)
                    .map((review, i) => (
                      <CourseReview
                        canModify={Boolean(user && review.userId === user.id)}
                        interactions={userInteractions}
                        handleDelete={() => handleDelete(review)}
                        key={i}
                        openEditReview={() => setEditReviewOpen(true)}
                        review={review}
                      />
                    ))
                : allReviews &&
                  allReviews.length > 0 && (
                    <ReviewEmptyPrompt className='my-8'>
                      No reviews have been left for this course with this
                      instructor yet.
                    </ReviewEmptyPrompt>
                  )}
            </div>
            {!showAllReviews && showingReviews.length > 8 && (
              <div className='flex justify-center text-gray-400 dark:text-neutral-500'>
                <button
                  className='size-full border border-dashed border-neutral-400 py-2 dark:border-neutral-500'
                  onClick={() => setShowAllReviews(true)}
                >
                  Show all {showingReviews.length} reviews
                </button>
              </div>
            )}
          </div>

          <div className='col-span-2 flex flex-col gap-5'>
            <CourseRequirements
              course={filteredCourse}
              requirements={requirements}
            />
            {courseAverages && courseAverages.length >= 1 && (
              <CourseAverages
                course={filteredCourse}
                averages={courseAverages}
              />
            )}
          </div>
        </div>
        <div className='flex flex-col lg:hidden'>
          <div className='mb-4 flex'>
            <CourseRequirements
              course={filteredCourse}
              requirements={requirements}
            />
          </div>

          <div className='mb-4 flex'>
            {courseAverages && courseAverages.length >= 1 && (
              <CourseAverages
                course={filteredCourse}
                averages={courseAverages}
              />
            )}
          </div>
          <SchedulesDisplay course={filteredCourse} />
          <div className='mt-4 flex w-full flex-row justify-between'>
            <div className='w-full'>
              {canReview && (
                <CourseReviewPrompt
                  openAddReview={() => setAddReviewOpen(true)}
                />
              )}
              {allReviews && allReviews.length > 0 ? (
                <div className='my-2'>
                  <ReviewFilter
                    course={filteredCourse}
                    allReviews={allReviews ?? []}
                    setReviews={setShowingReviews}
                    setShowAllReviews={setShowAllReviews}
                    sortBy={sortBy}
                    selectedInstructor={selectedInstructor}
                    setSortBy={setSortBy}
                    setSelectedInstructor={setSelectedInstructor}
                  />
                </div>
              ) : (
                <ReviewEmptyPrompt className='my-8'>
                  No reviews have been left for this course yet, be the first!
                </ReviewEmptyPrompt>
              )}
              <div className='w-full shadow-sm'>
                {userReview && (
                  <CourseReview
                    canModify={Boolean(user && userReview.userId === user.id)}
                    handleDelete={() => handleDelete(userReview)}
                    openEditReview={() => setEditReviewOpen(true)}
                    review={userReview}
                    interactions={userInteractions}
                  />
                )}
                {showingReviews.length > 0
                  ? showingReviews
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
                          interactions={userInteractions}
                        />
                      ))
                  : allReviews &&
                    allReviews.length > 0 && (
                      <ReviewEmptyPrompt className='my-8'>
                        No reviews have been left for this course with this
                        instructor yet.
                      </ReviewEmptyPrompt>
                    )}
              </div>
              {!showAllReviews && showingReviews.length > 8 && (
                <div className='flex justify-center text-gray-400 dark:text-neutral-500'>
                  <button
                    className='size-full border border-dashed border-neutral-400 py-2 dark:border-neutral-500'
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
          course={filteredCourse}
          open={addReviewOpen}
          onClose={() => setAddReviewOpen(false)}
        />
        {userReview && (
          <EditReviewForm
            course={filteredCourse}
            open={editReviewOpen}
            onClose={() => setEditReviewOpen(false)}
            review={userReview}
          />
        )}
      </div>
    </Layout>
  );
};
