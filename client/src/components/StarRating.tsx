import { Star } from 'react-feather';

type StarRatingProps = {
  rating: 1 | 2 | 3 | 4 | 5;
};

export const StarRating = ({ rating }: StarRatingProps) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        strokeWidth={0}
        className={i < rating ? 'fill-yellow-400' : 'fill-gray-200'}
      />
    );
  }
  return <div className='flex'>{...stars}</div>;
};
