import { Course } from '../model/course';
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
  const parser = new DOMParser();

  const [searchSelected, setSearchSelected] = useState(false);

  return (
    <div className='relative'>
      <div className='relative w-full mt-4'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search
            size={20}
            className={
              'transition duration-200 ' +
              (searchSelected ? 'stroke-red-600' : 'stroke-gray-400')
            }
            aria-hidden='true'
          />
        </div>
        <input
          type='text'
          className='outline-none border-none bg-neutral-50 border border-neutral-50 text-black text-sm rounded-lg block w-full pl-10 p-3 dark:bg-neutral-50 dark:border-neutral-50 dark:placeholder-neutral-500 dark:text-black'
          placeholder='Search for courses, subjects or professors'
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setSearchSelected(true)}
          onBlur={() => setTimeout(() => setSearchSelected(false), 80)}
        />
      </div>
      {searchSelected && (
        <div className='absolute top-full w-full bg-white rounded-b-lg shadow-md overflow-hidden z-10'>
          {results.map((result, index) => (
            <a href={`/course/${result._id}`}>
              <div
                className={`p-3 hover:bg-gray-100 cursor-pointer text-left ${
                  index < results.length - 1 && 'border-b border-gray-200'
                }`}
                key={result._id}
              >
                {result._id} -{' '}
                {
                  parser.parseFromString(result.title, 'text/html').body
                    .textContent
                }
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
