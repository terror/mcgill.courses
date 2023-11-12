import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { CourseSearchBar } from '../components/CourseSearchBar';
import { Layout } from '../components/Layout';
import { loadSearchIndex } from '../lib/searchIndex';
import type { SearchResults } from '../model/SearchResults';

const alerts: Map<string, string> = new Map([
  ['invalidMail', 'Please use a McGill email address to authenticate.'],
]);

const { courses, instructors, coursesIndex, instructorsIndex } =
  loadSearchIndex();

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
      .search(query, 4)
      ?.map((id: number) => courses[id]);
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
