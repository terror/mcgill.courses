type CourseReviewPromptProps = {
  openAddReview: () => void;
};

export const CourseReviewPrompt = ({
  openAddReview,
}: CourseReviewPromptProps) => {
  return (
    <div className='mx-3 my-2 mb-4 flex h-fit justify-between rounded-md bg-white px-3 py-2 dark:bg-neutral-800'>
      <p className='my-auto text-sm dark:text-gray-200 sm:text-lg'>
        Taken this course?{' '}
      </p>
      <button
        className='rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition duration-200 hover:bg-red-400 sm:text-lg'
        onClick={openAddReview}
      >
        Leave a review
      </button>
    </div>
  );
};
