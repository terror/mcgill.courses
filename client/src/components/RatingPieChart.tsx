import { PieChart } from 'react-minimal-pie-chart';

export const RatingPieChart = ({
  averageRating,
}: {
  averageRating: number;
}) => {
  return (
    <div className='flex flex-col'>
      <div className='relative z-10 mx-auto mb-5 flex h-1/2 w-3/5 rounded-full'>
        <PieChart
          data={[
            {
              value: averageRating,
              color: '#dc2626',
            },
            {
              value: 5 - averageRating,
              color: '#e4e4e7',
            },
          ]}
          lineWidth={20}
        />
        <div className='absolute inset-0 z-20 mx-auto my-auto flex w-10/12 items-center justify-center text-xl font-semibold text-gray-700 dark:text-gray-300'>
          {Math.round(averageRating * 100) / 100} / 5
        </div>
      </div>
    </div>
  );
};
