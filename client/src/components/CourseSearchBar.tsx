import { useState } from 'react';
import { Layers, Search } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';

import { classNames } from '../lib/classNames';
import { Course } from '../model/course';

type CourseSearchBarProps = {
  results: Course[];
  handleInputChange: (query: string) => void;
};

export const CourseSearchBar = ({
  results,
  handleInputChange,
}: CourseSearchBarProps) => {
  const parser = new DOMParser();
  const navigate = useNavigate();

  const [searchSelected, setSearchSelected] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : results.length - 1
      );
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < results.length - 1 ? prevIndex + 1 : 0
      );
    }
    if (selectedIndex > -1 && event.key === 'Enter') {
      navigate(`/course/${results[selectedIndex]._id}`);
    }
  };

  return (
    <div className='relative'>
      <div className='relative w-full mt-4'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
          <Search
            size={20}
            className={classNames(
              'transition duration-200',
              searchSelected ? 'stroke-red-600' : 'stroke-gray-400'
            )}
            aria-hidden='true'
          />
        </div>
        <input
          type='text'
          className='outline-none border-none bg-neutral-50 border border-neutral-50 text-black text-sm rounded-lg block w-full pl-10 p-3 dark:bg-neutral-50 dark:border-neutral-50 dark:placeholder-neutral-500 dark:text-black min-w-[600px]'
          placeholder='Search for courses, subjects or professors'
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setSearchSelected(true)}
          onBlur={() => setTimeout(() => setSearchSelected(false), 80)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {searchSelected && (
        <div className='absolute top-full w-full bg-white rounded-b-lg shadow-md overflow-hidden z-10'>
          {results.map((result, index) => (
            <Link to={`/course/${result._id}`}>
              <div
                className={classNames(
                  'p-3 hover:bg-gray-100 cursor-pointer text-left border-b border-gray-200',
                  selectedIndex === index ? 'bg-gray-100' : ''
                )}
                key={result._id}
              >
                {result._id} -{' '}
                {
                  parser.parseFromString(result.title, 'text/html').body
                    .textContent
                }
              </div>
            </Link>
          ))}
          <Link to={`/explore`}>
            <div className='p-3 hover:bg-gray-100 cursor-pointer text-left flex items-center'>
              <Layers /> <div className='ml-2'>Explore all courses</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
