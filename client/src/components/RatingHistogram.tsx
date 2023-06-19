import _ from 'lodash';

const Bar = ({ num, total }: { num: number; total: number }) => {
  const percentage = (num / total) * 100; // Calculate the percentage

  return (
    <div className='relative h-5 w-full bg-gray-300'>
      <div
        className='absolute left-0 top-0 h-full bg-red-700'
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const IndividualRating = ({
  rating,
  num,
  total,
}: {
  rating: number;
  num: number;
  total: number;
}) => {
  return (
    <div className='flex flex-row space-x-2'>
      <p className='w-3 flex-none dark:text-gray-200'>{rating}</p>
      <div className='flex-auto'>
        <Bar num={num} total={total} />
      </div>
      <p className='w-3 flex-none dark:text-gray-200'>{num}</p>
    </div>
  );
};

export const RatingHistogram = ({ ratings }: { ratings: number[] }) => {
  const total = _.sum(Object.values(ratings));

  return (
    <div className='flex w-full flex-col space-y-4'>
      {[5, 4, 3, 2, 1].map((n) => (
        <IndividualRating rating={n} num={ratings[n - 1]} total={total} />
      ))}
    </div>
  );
};
