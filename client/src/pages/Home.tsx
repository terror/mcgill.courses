import Index from 'flexsearch';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import data from '../../../seed/courses-2023-2024.json';
import { CourseSearchBar } from '../components/CourseSearchBar';
import { Layout } from '../components/Layout';
import { dedupeArray } from '../lib/utils';
import { Course } from '../model/Course';
import type { SearchResults } from '../model/SearchResults';

const alerts: Map<string, string> = new Map([
  ['invalidMail', 'Please use a McGill email address to authenticate.'],
]);

const courses: Course[] = data as Course[];
const instructors: Instructor[] = dedupeArray(
  data.flatMap((course) => course.instructors),
  (instructor) => instructor.name
);

const coursesIndex = new Index({
  tokenize: 'forward',
  limit: 4,
});

const instructorsIndex = new Index({
  tokenize: 'forward',
  limit: 2,
});

courses.forEach((course, i) =>
  coursesIndex.add(
    i,
    `${course._id} ${course.subject} ${course.title} ${course.code}`
  )
);
instructors.forEach((instructor, i) =>
  instructorsIndex.add(i, instructor.name)
);

export const Home = () => {
  const [searchParams] = useSearchParams();

  const [results, setResults] = useState<SearchResults>({
    query: '',
    courses: [],
    instructors: [],
  });

  useEffect(() => {
    const err = searchParams.get('err');
    if (err === null) return;
    toast.error(alerts.get(err));
  }, []);

  const updateSearchResults = async (query: string) => {
    const courseSearchResults = coursesIndex
      .search(query, 6)
      ?.map((id: number) => courses[id]);
    const instructorSearchResults = instructorsIndex
      .search(query, 2)
      ?.map((id: number) => instructors[id]);

    setResults({
      query: query,
      courses: courseSearchResults,
      instructors: instructorSearchResults,
    });
  };

  return (
    <Layout>
      <div className='relative isolate px-6 pt-14 lg:px-8'>
        <div className='mx-auto max-w-2xl py-8'>
          <div className='hidden sm:mb-8 sm:flex sm:justify-center'></div>
          <div className='text-center'>
            <h1 className='mb-6 text-left text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-200 md:text-5xl py-3'>
              Explore thousands of course and professor reviews from McGill
              students
            </h1>
            <CourseSearchBar
              results={results}
              handleInputChange={updateSearchResults}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};
