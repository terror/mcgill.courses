import { Review } from '../model/Review';
import { StarRatingInput } from './StarRatingInput';
import { StarRating } from './StarRating';
import { Instructor } from '../model/Instructor';

type ReviewFilterProps = {
  selectedInstructors: Instructor[];
  setSelectedInstructors: (instructors: Instructor[]) => void;
  selectedRatings: number[];
  setSelectedRatings: (ratings: number[]) => void;
  allReviews: Review[];
  setReviews: (reviews: Review[]) => void;
};

export const ReviewFilter = ({
  selectedInstructors,
  setSelectedInstructors,
  selectedRatings,
  setSelectedRatings,
  allReviews,
  setReviews,
}: ReviewFilterProps) => {
  return (
    <div className='mt-3 flex w-full flex-col rounded-lg dark:bg-neutral-800 dark:text-gray-200'>
      <h1>Filter by</h1>
      <div>
        <h2>Instructor</h2>
      </div>
      <div>
        <h2>Rating</h2>
      </div>
    </div>
  );
};
