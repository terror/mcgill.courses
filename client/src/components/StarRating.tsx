import { Star } from 'react-feather';

type StarRatingProps = {
  rating: number;
};

export const StarRating = ({ rating }: StarRatingProps) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        strokeWidth={0}
        className={i < rating ? 'fill-red-600' : 'fill-gray-200'}
        size={20}
      />
    );
  }
  return <div className='flex'>{...stars}</div>;
};
