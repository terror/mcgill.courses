import { Course } from '../types/course';
import { Search } from 'react-feather';
import { useState } from 'react';

type CourseSearchBarProps = {
  results: Course[];
  handleInputChange: (query: string) => void;
};

export const CourseSearchBar = ({
  results,
  handleInputChange,
}: CourseSearchBarProps) => {
  const [searchSelected, setSearchSelected] = useState(false);

  return (
    <div>
      <div className='relative w-full mt-4'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search
            size={20}
            className={
              'transition duration-200 ' +
              (searchSelected ? 'stroke-red-500' : 'stroke-gray-400')
            }
            aria-hidden='true'
          />
        </div>
        <input
          type='text'
          className='bg-neutral-50 border border-neutral-50 text-black text-sm rounded-lg block w-full pl-10 p-2.5 dark:bg-neutral-50 dark:border-neutral-50 dark:placeholder-neutral-500 dark:text-black'
          placeholder='Search for courses, subjects or professors'
          onChange={(event) => handleInputChange(event.target.value)}
          onSelect={() => setSearchSelected(true)}
          onBlur={() => setSearchSelected(false)}
        />
      </div>
      {results.map((result, i) => (
        <div className='rounded-lg border p-2' key={i}>
          {result.subject}
          {result.code} - {result.title}
        </div>
      ))}
    </div>
  );
};
