import {
  Chart,
  LinearScale,
  CategoryScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

Chart.register(LinearScale, CategoryScale, BarElement, Tooltip);

export const RatingHistogram = ({ ratings }: { ratings: number[] }) => {
  const data = {
    labels: [5, 4, 3, 2, 1],
    datasets: [
      {
        data: ratings,
        backgroundColor: '#dc2626',
        borderWidth: 0,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const count = ratings[context.dataIndex];
            return `Number of ratings: ${count}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: Math.max(...ratings) + 1,
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  } as const;

  return (
    <div className='h-full max-w-full'>
      <Bar data={data} options={options} />
    </div>
  );
};
