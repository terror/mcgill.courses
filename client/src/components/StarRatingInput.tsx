import React from 'react';
import { Star } from 'react-feather';

type StarRatingInputProps = {
  name: string;
  rating: number;
  setFieldValue: (name: string, value: any) => void;
};

export const StarRatingInput = ({
  name,
  rating,
  setFieldValue,
}: StarRatingInputProps) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <div
        className='cursor-pointer'
        onClick={() => setFieldValue(name, i + 1)}
      >
        <Star
          key={i}
          strokeWidth={0}
          className={i < rating ? 'fill-red-500' : 'fill-gray-200'}
          id={`${name}-star-${i}`}
        />
      </div>
    );
  }
  return <div className='flex'>{...stars}</div>;
};
