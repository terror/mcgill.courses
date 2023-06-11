import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { BsFillXSquareFill, BsSquare } from 'react-icons/bs';

import { Course } from '../model/Course';
import { Review } from '../model/Review';
import { Autocomplete } from './Autocomplete';
import { MultiSelect } from './MultiSelect';
import { StarRating } from './StarRating';

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

const Toggle = ({ isOn }: { isOn: boolean }) => {
  const size = 15;
  return isOn ? (
    <BsFillXSquareFill size={size} color='pink' />
  ) : (
    <BsSquare size={size} />
  );
};

const StarToggle = ({
  rating,
  onToggle,
  toggled,
}: {
  rating: number;
  onToggle: any;
  toggled: boolean;
}) => {
  return (
    <button
      className='flex flex-row items-center justify-between rounded-md p-0.5 py-1 transition duration-200 ease-in-out hover:bg-slate-50 dark:hover:bg-neutral-700 '
      onClick={onToggle}
    >
      <StarRating rating={rating} />
      <Toggle isOn={toggled} />
    </button>
  );
};

const RatingFilter = ({
  type,
  selectedRatings,
  setSelectedRatings,
  selectedDifficulties,
  setSelectedDifficulties,
}: {
  type: 'rating' | 'difficulty';
  selectedRatings: number[];
  setSelectedRatings: any;
  selectedDifficulties: number[];
  setSelectedDifficulties: any;
}) => {
  const ratingTypeMap = {
    rating: [selectedRatings, setSelectedRatings],
    difficulty: [selectedDifficulties, setSelectedDifficulties],
  };

  const toggleRating = ({ rating }: { rating: number }) => {
    return () => {
      if (ratingTypeMap[type][0].includes(rating)) {
        ratingTypeMap[type][1](
          ratingTypeMap[type][0].filter((r: number) => r !== rating)
        );
      } else {
        ratingTypeMap[type][1]([...ratingTypeMap[type][0], rating]);
      }
    };
  };

  return (
    <div className='flex flex-col'>
      <StarToggle
        rating={5}
        onToggle={toggleRating({ rating: 5 })}
        toggled={ratingTypeMap[type][0].includes(5)}
      />
      <StarToggle
        rating={4}
        onToggle={toggleRating({ rating: 4 })}
        toggled={ratingTypeMap[type][0].includes(4)}
      />
      <StarToggle
        rating={3}
        onToggle={toggleRating({ rating: 3 })}
        toggled={ratingTypeMap[type][0].includes(3)}
      />
      <StarToggle
        rating={2}
        onToggle={toggleRating({ rating: 2 })}
        toggled={ratingTypeMap[type][0].includes(2)}
      />
      <StarToggle
        rating={1}
        onToggle={toggleRating({ rating: 1 })}
        toggled={ratingTypeMap[type][0].includes(1)}
      />
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
  const title = 'text-xl my-2';

  useEffect(() => {
    setReviews(
      allReviews
        .filter(
          (review: Review) =>
            selectedInstructors.length === 0 ||
            selectedInstructors.filter((instructor: string) =>
              review.instructors
                .map((_) => _.toLowerCase())
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
    <div className='mt-3 flex w-full flex-col rounded-lg p-3 px-5 dark:bg-neutral-800 dark:text-gray-200'>
      <div>
        <h2 className={title}>Sort By</h2>
        <Autocomplete
          options={sorts}
          value={sortBy}
          setValue={(val: string) => setSortBy(val as ReviewSortType)}
        />
      </div>
      <div>
        <h2 className={title}>Instructor(s)</h2>
        <MultiSelect
          options={uniqueInstructors}
          values={selectedInstructors}
          setValues={setSelectedInstructors}
        />
      </div>
      <div>
        <h2 className={title}>Rating</h2>
        <RatingFilter
          type='rating'
          selectedRatings={selectedRatings}
          setSelectedRatings={setSelectedRatings}
          selectedDifficulties={selectedDifficulties}
          setSelectedDifficulties={setSelectedDifficulties}
        />
        <h2 className={title}>Difficulty</h2>
        <RatingFilter
          type='difficulty'
          selectedRatings={selectedRatings}
          setSelectedRatings={setSelectedRatings}
          selectedDifficulties={selectedDifficulties}
          setSelectedDifficulties={setSelectedDifficulties}
        />
      </div>
    </div>
  );
};
