import { Chart, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

Chart.register(ArcElement);

export const RatingPieChart = ({
  averageRating,
}: {
  averageRating: number;
}) => {
  const data = {
    labels: ['Average Rating', 'Remaining'],
    datasets: [
      {
        data: [averageRating, 5 - averageRating],
        backgroundColor: ['#dc2626', '#e4e4e7'],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '65%', // The size of the inner circle
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className='flex flex-col'>
      <div className='relative z-10 mx-auto flex h-1/2 w-3/5 rounded-full'>
        <Doughnut data={data} options={options} />
        <div className='text-l absolute inset-0 z-20 mx-auto my-auto flex w-10/12 items-center justify-center font-semibold text-gray-700 dark:text-gray-300'>
          {Math.round(averageRating * 100) / 100} / 5
        </div>
      </div>
    </div>
  );
};
