import _ from 'lodash';

type RatingHistogramProps = {
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

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

export const RatingHistogram = ({ ratings }: RatingHistogramProps) => {
  const total = _.sum(Object.values(ratings));

  return (
    <div className='flex w-full flex-col space-y-4'>
      <IndividualRating rating={5} num={ratings[5]} total={total} />
      <IndividualRating rating={4} num={ratings[4]} total={total} />
      <IndividualRating rating={3} num={ratings[3]} total={total} />
      <IndividualRating rating={2} num={ratings[2]} total={total} />
      <IndividualRating rating={1} num={ratings[1]} total={total} />
    </div>
  );
};
