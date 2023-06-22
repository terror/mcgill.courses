import { RatingPieChart } from './RatingPieChart';

export const RatingInfo = ({
  title,
  rating,
}: {
  title: string;
  rating: number;
}) => {
  return (
    <div className='w-full lg:w-3/4'>
      <h1 className='text-center text-xl font-semibold text-gray-800 dark:text-gray-200'>
        {title}
      </h1>
      <RatingPieChart rating={rating} />
    </div>
  );
};
