type CourseReviewPromptProps = {
  openAddReview: () => void;
};

export const CourseReviewPrompt = ({
  openAddReview,
}: CourseReviewPromptProps) => {
  return (
    <div className='mb-8 rounded-md bg-gray-50 p-3 dark:bg-neutral-800'>
      <p className='dark:text-gray-200'>
        Taken this course?{' '}
        <button
          className='ml-2 rounded-md bg-red-500 px-3 py-2 text-white transition duration-200 hover:bg-red-400'
          onClick={openAddReview}
        >
          Leave a review
        </button>
      </p>
    </div>
  );
};
