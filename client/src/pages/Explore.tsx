import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

import { CourseCard } from '../components/CourseCard';
import { ExploreFilter } from '../components/ExploreFilter';
import { FilterToggle } from '../components/FilterToggle';
import { JumpToTopButton } from '../components/JumpToTopButton';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import { fetchClient } from '../lib/fetchClient';
import { getCurrentTerms } from '../lib/utils';
import { Course } from '../model/Course';

export const Explore = () => {
  const limit = 20;
  const currentTerms = getCurrentTerms();

  const [courses, setCourses] = useState<Course[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(limit);

  const [query, setQuery] = useState<string>('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

  const nullable = (arr: string[]) => (arr.length === 0 ? null : arr);

  const body = {
    subjects: nullable(selectedSubjects),
    levels: nullable(selectedLevels.map((l) => l.charAt(0))),
    terms: nullable(
      selectedTerms.map(
        (term) => currentTerms.filter((t) => t.split(' ')[0] === term)[0]
      )
    ),
    query,
  };

  useEffect(() => {
    fetchClient
      .postData<Course[]>(`/courses?limit=${limit}`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((data) => setCourses(data))
      .catch(() =>
        toast.error('Failed to fetch courses. Please try again later.')
      );
    setHasMore(true);
    setOffset(limit);
  }, [selectedSubjects, selectedLevels, selectedTerms, query]);

  const fetchMore = async () => {
    const batch = await fetchClient.postData<Course[]>(
      `/courses?limit=${limit}&offset=${offset}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (batch.length === 0) setHasMore(false);
    else {
      setCourses(courses.concat(batch));
      setOffset(offset + limit);
    }
  };

  const handleInputChange = (query: string) => {
    setQuery(query);
  };

  return (
    <Layout>
      <div className='p-4'>
        <div className='flex w-full flex-col items-center py-8'>
          <h1 className='mb-16 text-center text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-200 sm:text-5xl'>
            Explore all courses
          </h1>

          <div className='relative flex flex-col lg:flex-row'>
            <div className='m-2 lg:hidden'>
              <FilterToggle>
                <ExploreFilter
                  selectedSubjects={selectedSubjects}
                  setSelectedSubjects={setSelectedSubjects}
                  selectedLevels={selectedLevels}
                  setSelectedLevels={setSelectedLevels}
                  selectedTerms={selectedTerms}
                  setSelectedTerms={setSelectedTerms}
                  variant='mobile'
                />
              </FilterToggle>
            </div>
            <InfiniteScroll
              dataLength={courses.length}
              hasMore={hasMore}
              loader={
                courses.length >= 20 && hasMore ? (
                  <div className='mt-4 text-center'>
                    <Spinner />
                  </div>
                ) : null
              }
              next={fetchMore}
              style={{ overflowY: 'hidden' }}
            >
              <input
                type='text'
                className={twMerge(
                  'block w-full rounded-lg bg-slate-200 p-3 pl-4 text-sm text-black outline-none dark:border-neutral-50 dark:bg-neutral-800 dark:text-gray-200 dark:placeholder:text-neutral-500'
                )}
                placeholder='Search through course title and description...'
                onChange={(event) => handleInputChange(event.target.value)}
              />
              <div className='mx-auto flex flex-col'>
                {courses.map(
                  (course, i) =>
                    course.description && (
                      <CourseCard key={i} course={course} className='m-2' />
                    )
                )}
                {!hasMore || courses.length === 0 ? (
                  <div className='mx-[200px] mt-4 text-center'>
                    <p className='text-gray-500 dark:text-gray-400'>
                      No more courses to show
                    </p>
                  </div>
                ) : null}
              </div>
            </InfiniteScroll>
            <div className='m-2 hidden lg:flex'>
              <ExploreFilter
                selectedSubjects={selectedSubjects}
                setSelectedSubjects={setSelectedSubjects}
                selectedLevels={selectedLevels}
                setSelectedLevels={setSelectedLevels}
                selectedTerms={selectedTerms}
                setSelectedTerms={setSelectedTerms}
                variant='desktop'
              />
            </div>
          </div>
        </div>
      </div>
      <JumpToTopButton />
    </Layout>
  );
};
