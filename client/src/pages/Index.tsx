import { useState, useEffect, useCallback } from 'react';

import Fuse from 'fuse.js';
import magnifyingGlass from '../assets/magnifyingGlass.png';
import { Course } from '../model/Course';
import { SearchResult } from '../model/SearchResult';

const debounce = (f: (v: string) => void, delay: number) => {
  let lastTimeout: number = 0;

  return (value: string) => {
    if (lastTimeout) clearTimeout(lastTimeout);
    lastTimeout = setTimeout(() => {
      f(value);
    }, delay);
  };
};

const Navbar = () => {
  return (
    <div className='w-screen flex justify-between p-10'>
      <div className='flex items-center justify-center'></div>
      <div className='flex items-center justify-center text-xl'>
        <a className='cursor-pointer pr-6'>Login</a>
      </div>
    </div>
  );
};

function SearchBar({ data }: { data: Course[] }) {
  const [results, setResults] = useState<SearchResult[]>([]);

  const fuse = new Fuse(data, { keys: ['title', 'subject', 'code'] });

  const handleInputChange = useCallback(
    debounce((query: string) => {
      setResults(fuse.search(query) as any);
    }, 150),
    [fuse]
  );

  return (
    <div
      className='searchpanel absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
    space-y-10 '
    >
      <div className='searchbar-wrapper'>
        <img className='searchbar-icon' src={magnifyingGlass} alt='search' />
        <input
          className='searchbar-input'
          type='text'
          placeholder='Search for courses or instructors'
          onChange={(event) => handleInputChange(event.target.value)}
        />
      </div>
      <div className='absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-left w-full text-lg'>
        <ul className='searchpanel-list'>
          {results.slice(0, 8).map((result: SearchResult) => (
            <a
              href={`/course/${result.item.subject}${result.item.code}`}
              key={result.refIndex}
            >
              {' '}
              <li>
                <p className='disabled:hover'>{result.item.title}</p>
              </li>
            </a>
          ))}
        </ul>
      </div>
      <div>
        <p className='searchbar-text'>
          Explore the courses and instructors at{' '}
          <span className='text-red-500'>McGill University</span>
        </p>
      </div>
    </div>
  );
}

export const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className='flex flex-col items-center justify-center '>
      <Navbar />
      <SearchBar data={courses} />
    </div>
  );
};
