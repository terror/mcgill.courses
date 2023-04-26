import _ from 'lodash';
import { useState } from 'react';
import { Layers, Search } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';

import { classNames } from '../lib/utils';
import { SearchResults } from '../model/SearchResults';

type CourseSearchBarProps = {
  results: SearchResults;
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
        prevIndex > 0 ? prevIndex - 1 : results.courses.length - 1
      );
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < results.courses.length - 1 ? prevIndex + 1 : 0
      );
    }

    if (selectedIndex > -1 && event.key === 'Enter')
      navigate(`/course/${results.courses[selectedIndex]._id}`);
  };

  return (
    <div className='relative'>
      <div className='relative w-full'>
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
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
          className='block w-full rounded-lg border border-none border-neutral-50 bg-neutral-50 p-3 pl-10 text-sm text-black outline-none dark:border-neutral-50 dark:bg-neutral-800 dark:text-gray-200 dark:placeholder-neutral-500 lg:min-w-[600px]'
          placeholder='Search for courses, subjects or professors'
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setSearchSelected(true)}
          onBlur={() => setTimeout(() => setSearchSelected(false), 100)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {searchSelected && (
        <div className='absolute top-full z-10 w-full overflow-hidden rounded-b-lg bg-white shadow-md dark:bg-neutral-800'>
          {results.courses.map((result, index) => {
            const courseText = `${result._id} - ${
              parser.parseFromString(result.title, 'text/html').body.textContent
            }`;

            const parts = courseText.split(
              new RegExp(`(${_.escapeRegExp(results.query)})`, 'gi')
            );

            return (
              <Link to={`/course/${result._id}`}>
                <div
                  className={classNames(
                    'cursor-pointer border-b border-gray-200 p-3 text-left hover:bg-gray-100 dark:border-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                    selectedIndex === index ? 'bg-gray-100' : ''
                  )}
                  key={result._id}
                >
                  <span className='dark:text-gray-200'>
                    {parts.map((part, i) => (
                      <span
                        key={i}
                        className={
                          part.toLowerCase() === results.query.toLowerCase()
                            ? 'underline'
                            : ''
                        }
                      >
                        {part}
                      </span>
                    ))}
                  </span>
                </div>
              </Link>
            );
          })}
          <Link to={`/explore`}>
            <div className='flex cursor-pointer items-center p-3 text-left hover:bg-gray-100 dark:border-gray-600 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700'>
              <Layers /> <div className='ml-2'>Explore all courses</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
