type CourseReviewPromptProps = {
  openAddReview: () => void;
};

export const CourseReviewPrompt = ({
  openAddReview,
}: CourseReviewPromptProps) => {
  return (
    <div className='mb-8 flex h-fit w-full justify-between rounded-md bg-gray-50 p-3 dark:bg-neutral-800'>
      <p className='my-auto ml-5 text-sm dark:text-gray-200 sm:text-lg'>
        Taken this course?{' '}
      </p>
      <button
        className='ml-2 mr-3 rounded-lg bg-red-500 px-3 py-2 text-sm text-white transition duration-200 hover:bg-red-400 sm:text-lg'
        onClick={openAddReview}
      >
        Leave a review
      </button>
    </div>
  );
};
