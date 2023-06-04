import { Review } from '../model/Review';
import { Course } from '../model/Course';
import { dedupeInstructors } from '../lib/utils';
import { StarRatingInput } from './StarRatingInput';
import { StarRating } from './StarRating';
import { Instructor } from '../model/Instructor';
import { useState, useEffect } from 'react';
import { BsSquare, BsFillXSquareFill } from 'react-icons/bs';
import { Combobox, Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid';

type ReviewFilterProps = {
  course: Course;
  sortBy: any;
  setSortBy: any;
  selectedInstructors: any;
  setSelectedInstructors: any;
  selectedRatings: any;
  setSelectedRatings: any;
  selectedDifficulties: any;
  setSelectedDifficulties: any;
  allReviews: any;
  setReviews: any;
};

const sorts = [
  { id: 1, name: 'Most Recent' },
  { id: 2, name: 'Least Recent' },
  { id: 3, name: 'Highest Rating' },
  { id: 4, name: 'Lowest Rating' },
  { id: 5, name: 'Hardest' },
  { id: 6, name: 'Easiest' },
];

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
  const [isOn, setIsOn] = useState(toggled);
  const handleClick = () => {
    setIsOn(!isOn);
    onToggle;
  };

  return (
    <button
      className='flex flex-row items-center justify-between rounded-md p-0.5 transition duration-200 ease-in-out hover:bg-neutral-700'
      onClick={handleClick}
    >
      <StarRating rating={rating} />
      <Toggle isOn={isOn} />
    </button>
  );
};

const SortDropdown = ({
  selectedSort,
  setSelectedSort,
}: {
  selectedSort: any;
  setSelectedSort: any;
}) => {
  return (
    <div className='w-full'>
      <Listbox value={selectedSort} onChange={setSelectedSort}>
        <div className='relative mt-1'>
          <Listbox.Button className='relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-red-300 dark:bg-neutral-700 sm:text-sm'>
            <span className='block truncate'>{selectedSort.name}</span>
            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
              <ChevronUpDownIcon
                className='h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </span>
          </Listbox.Button>
          <Transition
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-700 sm:text-sm'>
              {sorts.map((sort, sortId) => (
                <Listbox.Option
                  key={sortId}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-red-100 text-red-900' : '900'
                    }`
                  }
                  value={sort}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {sort.name}
                      </span>
                      {selected || sort.name === selectedSort.name ? (
                        <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-red-600'>
                          <CheckIcon className='h-5 w-5' aria-hidden='true' />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

const InstructorsDropdown = ({
  selectedInstructors,
  setSelectedInstructors,
  allInstructors,
}: {
  selectedInstructors: Instructor[];
  setSelectedInstructors: any;
  allInstructors: Instructor[];
}) => {
  const [query, setQuery] = useState('');

  const filteredData = dedupeInstructors(allInstructors);
  return (
    <div className='flex flex-col'>
      <div className='rounded-md'>
        <Combobox
          value={selectedInstructors}
          onChange={(val) => setSelectedInstructors(val)}
          multiple
        >
          {' '}
          <Combobox.Input
            className='w-full rounded-md border-none bg-neutral-50 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none dark:bg-neutral-700 dark:text-gray-200'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && filteredData.length > 0) {
                setQuery('');
              }
            }}
            autoComplete='off'
          />
          <Transition
            enter='transition ease-in-out duration-100 transform'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='transition ease-in-out duration-75 transform'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <div className='absolute z-50 w-full bg-white'>
              {query !== '' && (
                <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-700 sm:text-sm'>
                  {filteredData.length > 0 ? (
                    filteredData.map((data, i) => (
                      <Combobox.Option key={i} value={data}>
                        {({ active, selected }) => (
                          <div
                            className={`${
                              active
                                ? 'bg-red-600 text-gray-100'
                                : 'text-gray-700 dark:text-gray-100'
                            } flex flex-row justify-between p-2 text-lg`}
                            onClick={() => {
                              setQuery('');
                            }}
                          >
                            {data.name}
                            {selected && (
                              <span className='flex items-center pl-3 text-red-600'>
                                <CheckIcon
                                  className='h-5 w-5'
                                  color='pink'
                                  aria-hidden='true'
                                />
                              </span>
                            )}
                          </div>
                        )}
                      </Combobox.Option>
                    ))
                  ) : (
                    <p className='text-md p-2  text-gray-800 dark:text-gray-100'>
                      Nothing Found.
                    </p>
                  )}
                </Combobox.Options>
              )}
            </div>
          </Transition>
        </Combobox>
      </div>
    </div>
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

  const toggleRating = ({
    type,
    rating,
  }: {
    type: 'rating' | 'difficulty';
    rating: number;
  }) => {
    useEffect(() => {
      if (ratingTypeMap[type][0].includes(rating)) {
        ratingTypeMap[type][1](
          ratingTypeMap[type][0].filter((r: number) => r !== rating)
        );
      } else {
        ratingTypeMap[type][1]([...ratingTypeMap[type][0], rating]);
      }
    }, [type, rating]);
  };

  return (
    <div className='flex flex-col'>
      <StarToggle
        rating={5}
        onToggle={toggleRating({ type: type, rating: 5 })}
        toggled={selectedDifficulties.includes(5)}
      />
      <StarToggle
        rating={4}
        onToggle={toggleRating({ type: type, rating: 4 })}
        toggled={selectedDifficulties.includes(4)}
      />
      <StarToggle
        rating={3}
        onToggle={toggleRating({ type: type, rating: 3 })}
        toggled={selectedDifficulties.includes(3)}
      />
      <StarToggle
        rating={2}
        onToggle={toggleRating({ type: type, rating: 2 })}
        toggled={selectedDifficulties.includes(2)}
      />
      <StarToggle
        rating={1}
        onToggle={toggleRating({ type: type, rating: 1 })}
        toggled={selectedDifficulties.includes(1)}
      />
    </div>
  );
};

export const ReviewFilter = ({
  course,
  sortBy,
  setSortBy,
  selectedInstructors,
  setSelectedInstructors,
  selectedRatings,
  setSelectedRatings,
  selectedDifficulties,
  setSelectedDifficulties,
  allReviews,
  setReviews,
}: ReviewFilterProps) => {
  const title = 'text-xl my-2';
  useEffect(() => {
    const filteredReviews = allReviews.filter((review: Review) => {
      (selectedInstructors.includes(review.instructor) ||
        selectedInstructors.length === 0) &&
        (selectedRatings.includes(review.rating) ||
          selectedRatings.length === 0);
    });

    setReviews(filteredReviews);
  }, []);

  return (
    <div className='mt-3 flex w-full flex-col rounded-lg p-3 px-5 dark:bg-neutral-800 dark:text-gray-200'>
      <div>
        <h2 className={title}>Sort By</h2>
        <SortDropdown selectedSort={sortBy} setSelectedSort={setSortBy} />
      </div>
      <div>
        <h2 className={title}>Instructor(s)</h2>
        <InstructorsDropdown
          selectedInstructors={selectedInstructors}
          setSelectedInstructors={setSelectedInstructors}
          allInstructors={course.instructors}
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
