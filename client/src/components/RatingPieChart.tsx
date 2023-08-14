import { PieChart } from 'react-minimal-pie-chart';

type RatingPieChartProps = {
  rating: number;
};

export const RatingPieChart = ({ rating }: RatingPieChartProps) => {
  return (
    <div className='flex flex-col'>
      <div className='relative z-10 mx-auto my-5 flex h-1/2 w-3/5 rounded-full '>
        <PieChart
          animate={true}
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
        <div className='text-md absolute inset-0 z-20 m-auto flex w-10/12 items-center justify-center font-semibold text-gray-700 dark:text-gray-300 lg:text-xl'>
          {Math.round(rating * 100) / 100} / 5
        </div>
      </div>
    </div>
  );
};
