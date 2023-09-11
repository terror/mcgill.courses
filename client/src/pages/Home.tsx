import { useState } from 'react';

import { Alert } from '../components/Alert';
import { CourseSearchBar } from '../components/CourseSearchBar';
import { Layout } from '../components/Layout';
import { SearchResults } from '../model/SearchResults';
import { fetchClient } from '../lib/fetchClient';
import { useSearchParams } from 'react-router-dom';

const alerts: Map<string, string> = new Map([
  ['invalidMail', 'Please use a McGill email address to authenticate.'],
]);

export const Home = () => {
  const [searchParams] = useSearchParams();

  const [results, setResults] = useState<SearchResults>({
    query: '',
    courses: [],
    instructors: [],
  });

  const handleInputChange = async (query: string) => {
    try {
      setResults({
        query,
        ...(await fetchClient.getData<SearchResults>(
          `/search?query=${encodeURIComponent(query)}`
        )),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const err = searchParams.get('err');

  return (
    <Layout>
      <div className='relative isolate px-6 pt-14 lg:px-8'>
        <div className='mx-auto max-w-2xl py-8'>
          <div className='hidden sm:mb-8 sm:flex sm:justify-center'></div>
          <div className='text-center'>
            <h1 className='mb-6 text-left text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-200 md:text-5xl'>
              Explore thousands of course and professor reviews from McGill
              students
            </h1>
            <CourseSearchBar
              results={results}
              handleInputChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      {err && <Alert status='error' message={alerts.get(err)} />}
    </Layout>
  );
};
