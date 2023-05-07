import { PieChart } from 'react-minimal-pie-chart';

type RatingPieChartProps = {
  rating: number;
  numReviews: number;
};

export const RatingPieChart = ({ rating, numReviews }: RatingPieChartProps) => {
  return (
    <div className='flex flex-col'>
      <div className='relative z-10 mx-auto my-5 flex h-1/2 w-1/2 rounded-full '>
        <PieChart
          data={[
            {
              value: rating,
              color: '#dc2626',
            },
            {
              value: 5 - rating,
              color: '#e4e4e7',
            },
          ]}
          lineWidth={20}
        />
        <div className='absolute inset-0 z-20 mx-auto my-auto flex w-10/12 items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300'>
          {rating}/5
        </div>
      </div>
      <div className='flex justify-between'>
        <div className='mx-auto text-sm text-gray-500 dark:text-gray-400'>
          {numReviews} review{numReviews === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
};
