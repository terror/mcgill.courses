import { RatingPieChart } from './RatingPieChart';

export const RatingInfo = ({
  rating,
  numReviews,
  content,
}: {
  rating: number;
  numReviews: number;
  content?: string;
}) => {
  return (
    <div className='w-full lg:w-3/4'>
      {numReviews > 0 ? (
        <RatingPieChart rating={rating} numReviews={numReviews} />
      ) : (
        <div className='text-left text-gray-700 dark:text-gray-200 md:text-center'>
          {content ??
            'No reviews have been left for this course yet. Be the first!'}
        </div>
      )}
    </div>
  );
};
