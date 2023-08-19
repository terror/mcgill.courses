import _ from 'lodash';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
// import { Star } from 'react-feather';

import { Course } from '../model/Course';
import { Review } from '../model/Review';
import { Autocomplete } from './Autocomplete';
import { Disclosure } from '@headlessui/react';
import { LuChevronDown } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';

const sortTypes = [
  'Most Recent',
  'Least Recent',
  'Highest Rating',
  'Lowest Rating',
  'Hardest',
  'Easiest',
] as const;

export type ReviewSortType = (typeof sortTypes)[number];

// type StarToggleProps = {
//   onToggle: () => void;
//   toggled: boolean;
// };
//
// const StarToggle = ({ onToggle, toggled }: StarToggleProps) => {
//   return (
//     <button className='relative w-fit' onClick={onToggle}>
//       <Star
//         size={28}
//         stroke='none'
//         className={toggled ? 'fill-red-600' : 'fill-gray-200'}
//       />
//     </button>
//   );
// };

// type RatingFilterProps = {
//   ratings: number[];
//   setRatings: Dispatch<SetStateAction<number[]>>;
// };

// const RatingFilter = ({ ratings, setRatings }: RatingFilterProps) => {
//   const toggleRating = (rating: number) => {
//     return () => {
//       if (ratings.includes(rating)) {
//         setRatings(ratings.filter((r: number) => r !== rating));
//       } else {
//         setRatings([...ratings, rating]);
//       }
//     };
//   };
//
//   return (
//     <div className='flex'>
//       {[1, 2, 3, 4, 5].map((x, i) => (
//         <div key={i} className='flex flex-col'>
//           <StarToggle
//             key={`star-rating-${x}`}
//             onToggle={toggleRating(x)}
//             toggled={ratings.includes(x)}
//           />
//           <div className='text-center text-xs font-bold'>{x}</div>
//         </div>
//       ))}
//     </div>
//   );
// };
//
type FieldLabelProps = {
  children: string;
};

const FieldLabel = ({ children }: FieldLabelProps) => (
  <h2 className='mb-2 text-sm font-medium text-gray-600'>{children}</h2>
);

type ReviewFilterProps = {
  course: Course;
  allReviews: Review[];
  setReviews: Dispatch<SetStateAction<Review[]>>;
  setShowAllReviews: Dispatch<SetStateAction<boolean>>;
};

export const ReviewFilter = ({
  course,
  allReviews,
  setReviews,
  setShowAllReviews,
}: ReviewFilterProps) => {
  const [sortBy, setSortBy] = useState<ReviewSortType>('Most Recent');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  // const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  // const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>(
  //   []
  // );

  useEffect(() => {
    setReviews(
      allReviews
        .filter(
          (review: Review) =>
            selectedInstructor === '' ||
            review.instructors
              .map((ins) => ins.toLowerCase())
              .includes(selectedInstructor.toLowerCase())
        )
        // .filter(
        //   (review: Review) =>
        //     selectedRatings.length === 0 ||
        //     selectedRatings.includes(review.rating)
        // )
        // .filter(
        //   (review: Review) =>
        //     selectedDifficulties.length === 0 ||
        //     selectedDifficulties.includes(review.difficulty)
        // )
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
  }, [sortBy, selectedInstructor]);

  const sorts = useMemo(() => sortTypes.slice(), []);
  const uniqueInstructors = _.uniq(course.instructors.map((ins) => ins.name));

  return (
    <div className='flex flex-col rounded-lg bg-slate-50 px-3 dark:bg-neutral-800 dark:text-gray-200'>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button>
              <div className='flex w-full justify-between rounded-lg bg-gray-100 px-4 py-2 text-red-500'>
                <h1 className='text-sm font-medium text-gray-600'>Filter...</h1>
                {/* <ResetButton */}
                {/*   className='ml-auto' */}
                {/*   onClear={() => { */}
                {/*     setSortBy('Most Recent'); */}
                {/*     setSelectedInstructors([]); */}
                {/*     setSelectedRatings([]); */}
                {/*     setSelectedDifficulties([]); */}
                {/*   }} */}
                {/* /> */}
                <LuChevronDown
                  className={twMerge(
                    open ? 'rotate-180 transform' : '',
                    'h-5 w-5 text-gray-500'
                  )}
                />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel>
              <div className='py-2' />
              <div className='px-2'>
                <div className='flex gap-x-2'>
                  <div className='w-2/5'>
                    <FieldLabel>Sort by</FieldLabel>
                    <div className='relative z-10'>
                      <Autocomplete
                        options={sorts}
                        value={sortBy}
                        setValue={(val: string) =>
                          setSortBy(val as ReviewSortType)
                        }
                      />
                    </div>
                  </div>
                  <div className='w-3/5'>
                    <FieldLabel>Instructor(s)</FieldLabel>
                    <div className='relative z-10'>
                      <Autocomplete
                        options={uniqueInstructors}
                        value={selectedInstructor}
                        setValue={setSelectedInstructor}
                      />
                    </div>
                  </div>
                </div>
                {/* <div className='flex flex-wrap gap-x-8 gap-y-4'> */}
                {/*   <div> */}
                {/*     <FieldLabel>Rating</FieldLabel> */}
                {/*     <RatingFilter */}
                {/*       ratings={selectedRatings} */}
                {/*       setRatings={setSelectedRatings} */}
                {/*     /> */}
                {/*   </div> */}
                {/*   <div> */}
                {/*     <FieldLabel>Difficulty</FieldLabel> */}
                {/*     <RatingFilter */}
                {/*       ratings={selectedDifficulties} */}
                {/*       setRatings={setSelectedDifficulties} */}
                {/*     /> */}
                {/*   </div> */}
                {/* </div> */}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
};
