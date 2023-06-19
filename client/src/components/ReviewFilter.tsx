import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Star } from 'react-feather';

import { Course } from '../model/Course';
import { Review } from '../model/Review';
import { Autocomplete } from './Autocomplete';
import { MultiSelect } from './MultiSelect';

const sortTypes = [
  'Most Recent',
  'Least Recent',
  'Highest Rating',
  'Lowest Rating',
  'Hardest',
  'Easiest',
] as const;

export type ReviewSortType = (typeof sortTypes)[number];

type ReviewFilterProps = {
  course: Course;
  allReviews: Review[];
  setReviews: Dispatch<SetStateAction<Review[]>>;
  setShowAllReviews: Dispatch<SetStateAction<boolean>>;
};

const StarToggle = ({
  onToggle,
  toggled,
}: {
  onToggle: () => void;
  toggled: boolean;
}) => {
  return (
    <button className='relative w-fit' onClick={onToggle}>
      <Star
        size={28}
        stroke='none'
        className={toggled ? 'fill-red-600' : 'fill-gray-200'}
      />
    </button>
  );
};

type RatingFilterProps = {
  ratings: number[];
  setRatings: Dispatch<SetStateAction<number[]>>;
};

const RatingFilter = ({ ratings, setRatings }: RatingFilterProps) => {
  const toggleRating = (rating: number) => {
    return () => {
      if (ratings.includes(rating)) {
        setRatings(ratings.filter((r: number) => r !== rating));
      } else {
        setRatings([...ratings, rating]);
      }
    };
  };

  return (
    <div className='flex'>
      {[1, 2, 3, 4, 5].map((x) => (
        <div className='flex flex-col'>
          <StarToggle
            key={`star-rating-${x}`}
            onToggle={toggleRating(x)}
            toggled={ratings.includes(x)}
          />
          <div className='-mt-1 text-center text-xs font-bold'>{x}</div>
        </div>
      ))}
    </div>
  );
};

export const ReviewFilter = ({
  course,
  allReviews,
  setReviews,
  setShowAllReviews,
}: ReviewFilterProps) => {
  const [sortBy, setSortBy] = useState<ReviewSortType>('Most Recent');
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>(
    []
  );

  useEffect(() => {
    setReviews(
      allReviews
        .filter(
          (review: Review) =>
            selectedInstructors.length === 0 ||
            selectedInstructors.filter((instructor: string) =>
              review.instructors
                .map((ins) => ins.toLowerCase())
                .includes(instructor.toLowerCase())
            ).length !== 0
        )
        .filter(
          (review: Review) =>
            selectedRatings.length === 0 ||
            selectedRatings.includes(review.rating)
        )
        .filter(
          (review: Review) =>
            selectedDifficulties.length === 0 ||
            selectedDifficulties.includes(review.difficulty)
        )
        .sort((a: Review, b: Review) => {
          switch (sortBy) {
            case 'Most Recent':
              return (
                parseInt(b.timestamp.$date.$numberLong, 10) -
                parseInt(a.timestamp.$date.$numberLong, 10)
              );
            case 'Least Recent':
              return (
                parseInt(a.timestamp.$date.$numberLong, 10) -
                parseInt(b.timestamp.$date.$numberLong, 10)
              );
            case 'Highest Rating':
              return b.rating - a.rating;
            case 'Lowest Rating':
              return a.rating - b.rating;
            case 'Hardest':
              return b.difficulty - a.difficulty;
            case 'Easiest':
              return a.difficulty - b.difficulty;
            default:
              return (
                parseInt(b.timestamp.$date.$numberLong, 10) -
                parseInt(a.timestamp.$date.$numberLong, 10)
              );
          }
        })
    );
    setShowAllReviews(false);
  }, [sortBy, selectedDifficulties, selectedInstructors, selectedRatings]);

  const sorts = useMemo(() => sortTypes.slice(), []);
  const uniqueInstructors = _.uniq(course.instructors.map((ins) => ins.name));

  return (
    <div className='flex flex-col space-y-4 rounded-lg bg-slate-50 p-8 dark:bg-neutral-800 dark:text-gray-200'>
      <h1 className='text-xl font-bold'>Filter</h1>
      <div>
        <h2 className='mb-2 text-sm font-semibold'>Sort by</h2>
        <div className='relative z-20'>
          <Autocomplete
            options={sorts}
            value={sortBy}
            setValue={(val: string) => setSortBy(val as ReviewSortType)}
          />
        </div>
      </div>
      <div>
        <h2 className='mb-2 text-sm font-semibold'>Instructor(s)</h2>
        <div className='relative z-10'>
          <MultiSelect
            options={uniqueInstructors}
            values={selectedInstructors}
            setValues={setSelectedInstructors}
          />
        </div>
      </div>
      <div className='flex flex-wrap gap-x-8 gap-y-4'>
        <div>
          <h2 className='mb-2 text-sm font-semibold'>Rating</h2>
          <RatingFilter
            ratings={selectedRatings}
            setRatings={setSelectedRatings}
          />
        </div>
        <div>
          <h2 className='mb-2 text-sm font-semibold'>Difficulty</h2>
          <RatingFilter
            ratings={selectedDifficulties}
            setRatings={setSelectedDifficulties}
          />
        </div>
      </div>
    </div>
  );
};
