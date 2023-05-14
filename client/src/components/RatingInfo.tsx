import { RatingPieChart } from './RatingPieChart';

export const RatingInfo = ({
  rating,
  numReviews,
}: {
  rating: number;
  numReviews: number;
}) => {
  return (
    <div className='w-full lg:w-3/4'>
      {numReviews > 0 ? (
        <RatingPieChart rating={rating} numReviews={numReviews} />
      ) : (
        <div className='text-left text-gray-700 dark:text-gray-200 md:text-center'>
          No reviews have been left for this course yet. Be the first!
        </div>
      )}
    </div>
  );
};
