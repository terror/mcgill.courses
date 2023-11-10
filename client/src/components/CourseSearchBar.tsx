import { useState } from 'react';
import { Layers, User } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

import { courseIdToUrlParam, spliceCourseCode } from '../lib/utils';
import type { SearchResults } from '../model/SearchResults';
import { Highlight } from './Highlight';
import { SearchBar } from './SearchBar';

type SearchResultType = 'course' | 'instructor';

type SearchResultProps = {
  index: number;
  query?: string;
  selectedIndex: number;
  text: string;
  type: SearchResultType;
  url: string;
};

const SearchResult = ({
  index,
  query,
  selectedIndex,
  text,
  type,
  url,
}: SearchResultProps) => {
  const icon =
    type === 'course' ? (
      <Layers className='mr-2 dark:text-white' />
    ) : (
      <User className='mr-2 dark:text-white' />
    );

  return (
    <Link to={url}>
      <div
        className={twMerge(
          'flex cursor-pointer border-b border-gray-200 p-3 text-left hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-700',
          selectedIndex === index
            ? 'bg-gray-100 dark:bg-neutral-700'
            : 'bg-white dark:bg-neutral-800'
        )}
        key={index}
      >
        {icon}
        <Highlight
          className='dark:text-gray-200'
          query={query?.trim()}
          text={text}
        />
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
          ? `/course/${courseIdToUrlParam(results.courses[selectedIndex]._id)}`
          : `/instructor/${encodeURIComponent(
              results.instructors[selectedIndex - results.courses.length].name
            )}`
      );
  };

  return (
    <div className='relative'>
      <SearchBar
        handleInputChange={handleInputChange}
        inputStyle={twMerge(
          'block w-full rounded-t-lg bg-slate-200 p-3 pl-10 text-sm text-black outline-none dark:border-neutral-50 dark:bg-neutral-800 dark:text-gray-200 dark:placeholder:text-neutral-500 lg:min-w-[570px]',
          searchSelected ? '' : 'rounded-b-lg'
        )}
        onKeyDown={handleKeyDown}
        placeholder='Search for courses, subjects or professors'
        searchSelected={searchSelected}
        setSearchSelected={setSearchSelected}
      />
      {searchSelected && (
        <div className='absolute top-full z-50 w-full overflow-hidden rounded-b-lg bg-white shadow-md dark:bg-neutral-800'>
          {results.courses.map((result, index) => (
            <SearchResult
              index={index}
              query={results.query}
              selectedIndex={selectedIndex}
              text={`${spliceCourseCode(result._id, ' ')} - ${result.title}`}
              type='course'
              url={`/course/${courseIdToUrlParam(result._id)}`}
              key={result._id}
            />
          ))}
          {results.instructors.map((result, index) => (
            <SearchResult
              index={results.courses.length + index}
              query={results.query}
              selectedIndex={selectedIndex}
              text={result.name}
              type='instructor'
              url={`/instructor/${encodeURIComponent(result.name)}`}
              key={result.name + index}
            />
          ))}
          <Link to={`/explore`}>
            <div className='flex cursor-pointer items-center p-3 text-left hover:bg-gray-100 dark:border-gray-600 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700'>
              <Layers /> <div className='z-50 ml-2'>Explore all courses</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
