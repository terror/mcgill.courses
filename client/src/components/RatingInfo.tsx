import { RatingPieChart } from './RatingPieChart';
import { RatingHistogram } from './RatingHistogram';
import _ from 'lodash';

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
  ratings: number[];
  content?: string;
}) => {
  const averageRating =
    _.sum(ratings.map((value, index) => value * (index + 1))) / numReviews;

  const chart = (type: 'pie' | 'histogram') => {
    switch (type) {
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
    <div className='w-full md:px-8 lg:w-3/4 lg:p-0'>
      <h1 className='mb-3 text-center text-xl font-semibold text-gray-800 dark:text-gray-200'>
        {title}
      </h1>
      {numReviews > 0 ? (
        chart(chartType)
      ) : (
        <div className='text-left text-gray-700 dark:text-gray-200 md:text-center'>
          {content ?? 'No reviews have been left yet. Be the first!'}
        </div>
      )}
    </div>
  );
};
