type StarRatingProps = {
  rating: number;
  icon: any;
};

export const IconRating = ({ rating, icon: Icon }: StarRatingProps) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Icon
        key={i}
        className={
          i < rating
            ? 'fill-red-600 stroke-none'
            : 'stroke-gray-300 dark:stroke-gray-600'
        }
        size={20}
      />
    );
  }
  return <div className='flex'>{...stars}</div>;
};
