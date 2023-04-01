import { Star } from 'react-feather';

import { Course } from '../model/course';
import { Instructor } from '../model/instructor';
import { Requirements } from '../model/requirements';
import { Review } from '../model/review';

type CourseReviewProps = {
  review: Review;
};

type FillbarProps = {
  fillAmount: number;
  width?: number;
  height?: number;
};

type RatingProps = {
  text: string;
  rating: number;
};

type RequirementsProps = {
  requirements: Requirements;
};

export const Rating = ({ text, rating }: RatingProps) => {
  return (
    <div className='mt-1'>
      <span className='font-bold text-sm'>{text}</span>
      <Fillbar fillAmount={rating * 10} width={132} height={6} />
    </div>
  );
};

export const Fillbar = ({ fillAmount, width, height }: FillbarProps) => {
  return (
    <div
      className='bg-gray-200 rounded-xl'
      style={{ width: width ?? 48, height: height ?? 4 }}
    >
      <div
        className={'bg-red-500 rounded-xl'}
        style={{ width: `${fillAmount}%`, height: height ?? 4 }}
      />
    </div>
  );
};

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

export const CourseReview = ({ review }: CourseReviewProps) => {
  return (
    <div className='w-84 mx-4 p-6 bg-slate-50 rounded-md'>
      <div className='flex'>
        <div className='flex flex-col'>
          <div className='w-16 h-16 rounded-full bg-gray-200' />
          <div className='mt-2 text-sm'>
            <h2 className='leading-none mt-1 font-semibold text-gray-700'>
              Instructor:
            </h2>
            <p className='text-gray-700'>{review.instructor}</p>
            <h2 className='leading-none mt-1 font-semibold text-gray-700'>
              Term:
            </h2>
            <p className='text-gray-500'>{review.term}</p>
          </div>
        </div>
        <div className='ml-auto w-fit'>
          <StarRating rating={4} />
          <div className='ml-1 mt-6'>
            <Rating text='Difficulty' rating={review.difficultyRating} />
            <Rating text='Useful' rating={review.usefulRating} />
            <Rating text='Interesting' rating={review.interestingRating} />
          </div>
        </div>
      </div>
      <div className='mt-6 text-sm'>{review.text}</div>
    </div>
  );
};

export const CourseRequirements = ({ requirements }: RequirementsProps) => {
  return (
    <div className='w-screen md:w-1/3 md:mt-10 mx-4 p-6 bg-slate-50 rounded-md flex ml-auto mr-10'>
      <div className='flex-col space-y-3'>
        <div className='space-y-7'>
          {requirements.prereqs.length > 0 && (
            <div>
              <h2 className='leading-none mt-1 font-semibold text-gray-700'>
                Prerequisites
              </h2>
              {requirements.prereqs.map((prereq) => (
                <p className='text-gray-500'>{prereq}</p>
              ))}
            </div>
          )}
          {requirements.coreqs.length > 0 && (
            <div>
              <h2 className='leading-none mt-1 font-semibold text-gray-700'>
                Corequisites
              </h2>
              {requirements.coreqs.map((coreq) => (
                <p className='text-gray-500'>{coreq}</p>
              ))}
            </div>
          )}
          {requirements.restrictions.length > 0 && (
            <div>
              <h2 className='leading-none mt-1 font-semibold text-gray-700'>
                Restrictions
              </h2>
              {requirements.restrictions.map((restriction) => (
                <p className='text-gray-500'>{restriction}</p>
              ))}
            </div>
          )}
          {requirements.otherInformation.length > 0 && (
            <div>
              <h2 className='leading-none mt-1 font-semibold text-gray-700'>
                Other Information
              </h2>
              {requirements.otherInformation.map((info) => (
                <p className='text-gray-500'>{info}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
