import { useState } from 'react';

import _ from 'lodash';
import { Layers, Search, User } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';
import { SearchResults } from '../model/SearchResults';
import { classNames } from '../lib/utils';

enum SearchResultType {
  Course,
  Instructor,
}

interface SearchResultProps {
  index: number;
  query?: string;
  selectedIndex: number;
  text: string;
  type: SearchResultType;
  url: string;
}

const SearchResult = ({
  index,
  query,
  selectedIndex,
  text,
  type,
  url,
}: SearchResultProps) => {
  return (
    <Link to={url}>
      <div
        className={classNames(
          'z-50 flex cursor-pointer border-b border-gray-200 p-3 text-left hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-700',
          selectedIndex === index
            ? 'bg-gray-100 dark:bg-neutral-700'
            : 'bg-white dark:bg-neutral-800'
        )}
        key={index}
      >
        {type === SearchResultType.Course ? (
          <Layers className='mr-2 text-ellipsis dark:text-white' />
        ) : (
          <User className='mr-2 text-ellipsis dark:text-white' />
        )}
        <span className='dark:text-gray-200'>
          {text
            .split(new RegExp(`(${_.escapeRegExp(query)})`, 'gi'))
            .map((part, i) => (
              <span
                key={i}
                className={
                  part.toLowerCase().trim() === query?.toLowerCase().trim()
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
};

type CourseSearchBarProps = {
  results: SearchResults;
  handleInputChange: (query: string) => void;
};

export const CourseSearchBar = ({
  results,
  handleInputChange,
}: CourseSearchBarProps) => {
  const navigate = useNavigate();

  const [searchSelected, setSearchSelected] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const length = results.courses.length + results.instructors.length;

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : length - 1
      );
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < length - 1 ? prevIndex + 1 : 0
      );
    }

    if (selectedIndex > -1 && event.key === 'Enter')
      navigate(
        selectedIndex < results.courses.length
          ? `/course/${results.courses[selectedIndex]._id}`
          : `/instructor/${results.instructors[
              selectedIndex - results.courses.length
            ].name
              .toLowerCase()
              .split(' ')
              .join('-')}`
      );
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
          className='block w-full rounded-lg border border-none border-neutral-50 bg-neutral-50 p-3 pl-10 text-sm text-black outline-none dark:border-neutral-50 dark:bg-neutral-800 dark:text-gray-200 dark:placeholder-neutral-500 lg:min-w-[570px]'
          placeholder='Search for courses, subjects or professors'
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setSearchSelected(true)}
          onBlur={() => setTimeout(() => setSearchSelected(false), 100)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className='mb-3'>
        {searchSelected && (
          <div className='absolute top-full z-50 w-full rounded-b-lg bg-white shadow-md dark:bg-neutral-800'>
            {results.courses.slice(0, 4).map((result, index) => (
              <SearchResult
                index={index}
                query={results.query}
                selectedIndex={selectedIndex}
                text={`${result._id} - ${result.title}`}
                type={SearchResultType.Course}
                url={`/course/${result._id}`}
              />
            ))}
            {results.instructors.slice(0, 2).map((result, index) => (
              <SearchResult
                index={results.courses.length + index}
                query={results.query}
                selectedIndex={selectedIndex}
                text={result.name}
                type={SearchResultType.Instructor}
                url={`/instructor/${result.name
                  .toLowerCase()
                  .split(' ')
                  .join('-')}`}
              />
            ))}
            <Link to={`/explore`}>
              <div className='z-50 flex cursor-pointer items-center rounded-b-lg p-3 text-left hover:bg-gray-100 dark:border-gray-600 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700'>
                <Layers /> <div className='z-50 ml-2'>Explore all courses</div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
