import { RatingPieChart } from './RatingPieChart';

export const RatingInfo = ({
  title,
  rating,
  numReviews,
  content,
}: {
  title: string;
  rating: number;
  numReviews: number;
  content?: string;
}) => {
  return (
    <div className='w-full lg:w-3/4'>
      <h1 className='text-center text-xl font-semibold text-gray-800 dark:text-gray-200'>
        {title}
      </h1>
      {numReviews > 0 ? (
        <RatingPieChart rating={rating} />
      ) : (
        <div className='text-left text-gray-700 dark:text-gray-200 md:text-center'>
          {content ??
            'No reviews have been left for this course yet. Be the first!'}
        </div>
      )}
    </div>
  );
};
