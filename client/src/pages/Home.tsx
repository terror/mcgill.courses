import { Index } from 'flexsearch';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import data from '../../../seed/courses-2023-2024.json';
import { CourseSearchBar } from '../components/CourseSearchBar';
import { Layout } from '../components/Layout';
import { Course } from '../model/Course';
import { Instructor } from '../model/Instructor';
import type { SearchResults } from '../model/SearchResults';

const alerts: Map<string, string> = new Map([
  ['invalidMail', 'Please use a McGill email address to authenticate.'],
]);

const courses: Course[] = data as Course[];
const instructors: Instructor[] = _.uniqBy(
  courses.flatMap((course: Course) => course.instructors),
  (instructor: Instructor) => instructor.name
);

const coursesIndex = new Index({
  tokenize: 'forward',
});

const instructorsIndex = new Index({
  tokenize: 'forward',
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
      ?.map((id) => courses[id as number]);
    const instructorSearchResults = instructorsIndex
      .search(query, 2)
      ?.map((id) => instructors[id as number]);

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
            <h1 className='mb-6 py-3 text-left text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-200 md:text-5xl'>
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
