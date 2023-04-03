import { Fillbar } from './Fillbar';

type RatingProps = {
  text: string;
  rating: number;
};

export const Rating = ({ text, rating }: RatingProps) => {
  return (
    <div className='mt-1'>
      <span className='font-bold text-sm'>{text}</span>
      <Fillbar fillAmount={rating * 20} width={132} height={6} />
    </div>
  );
};
