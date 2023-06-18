import { RatingPieChart } from './RatingPieChart';
import { RatingHistogram } from './RatingHistogram';
import { map } from './CourseInfo';

export const RatingInfo = ({
  title,
  chartType,
  numReviews,
  ratings,
  content,
}: {
  title: string;
  chartType: 'pie' | 'histogram';
  numReviews: number;
  ratings: map;
  content?: string;
}) => {
  const averageRating =
    (1 * ratings[1] +
      2 * ratings[2] +
      3 * ratings[3] +
      4 * ratings[4] +
      5 * ratings[5]) /
    numReviews;

  const chart = (chartType: 'pie' | 'histogram') => {
    switch (chartType) {
      case 'pie':
        return (
          <div className='mx-1 pt-1'>
            <RatingPieChart averageRating={averageRating} />
          </div>
        );
      case 'histogram':
        return (
          <div className='mx-4'>
            <RatingHistogram ratings={ratings} />
          </div>
        );
    }
  };

  return (
    <div className='w-full lg:w-3/4'>
      <h1 className='mb-3 text-center text-xl font-semibold text-gray-800 dark:text-gray-200'>
        {title}
      </h1>
      {numReviews > 0 ? (
        chart(chartType)
      ) : (
        <div className='text-left text-gray-700 dark:text-gray-200 md:text-center'>
          {content ??
            'No reviews have been left for this course yet. Be the first!'}
        </div>
      )}
    </div>
  );
};
