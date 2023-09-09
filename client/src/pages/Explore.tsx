import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Alert } from '../components/Alert';
import { BoxToggle } from '../components/BoxToggle';
import { CourseCard } from '../components/CourseCard';
import { ExploreFilter } from '../components/ExploreFilter';
import { JumpToTopButton } from '../components/JumpToTopButton';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import { fetchClient } from '../lib/fetchClient';
import { getCurrentTerms } from '../lib/utils';
import { Course } from '../model/Course';

export const Explore = () => {
  const limit = 20;
  const currentTerms = getCurrentTerms();

  const [courses, setCourses] = useState<Course[] | undefined>(undefined);
  const [error, setError] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(limit);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

  const nullable = (arr: string[]) => (arr.length === 0 ? null : arr);

  const filters = {
    subjects: nullable(selectedSubjects),
    levels: nullable(selectedLevels.map((l) => l.charAt(0))),
    terms: nullable(
      selectedTerms.map(
        (term) => currentTerms.filter((t) => t.split(' ')[0] === term)[0]
      )
    ),
  };

  useEffect(() => {
    fetchClient
      .deserialize<Course[]>('POST', `/courses?limit=${limit}`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      })
      .then((data) => setCourses(data))
      .catch(() => setError(true));
    setHasMore(true);
    setOffset(limit);
  }, [selectedSubjects, selectedLevels, selectedTerms]);

  const fetchMore = async () => {
    const batch = await fetchClient.deserialize<Course[]>(
      'POST',
      `/courses?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      }
    );

    if (batch.length === 0) setHasMore(false);
    else {
      setCourses(courses?.concat(batch));
      setOffset(offset + limit);
    }
  };

  return (
    <Layout>
      <div className='p-4'>
        {error ? <Alert status='error' /> : null}
        <div className='flex w-full flex-col items-center py-8'>
          <h1 className='mb-16 text-center text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-200 sm:text-5xl'>
            Explore all courses
          </h1>
          <div className='flex flex-col lg:flex-row'>
            <div className='mx-2 flex max-w-xl items-center justify-center lg:hidden'>
              <BoxToggle
                child={ExploreFilter({
                  selectedSubjects,
                  setSelectedSubjects,
                  selectedLevels,
                  setSelectedLevels,
                  selectedTerms,
                  setSelectedTerms,
                  variant: 'mobile',
                })}
                open={filterOpen}
                setOpen={setFilterOpen}
              />
            </div>
            <InfiniteScroll
              dataLength={courses?.length || 0}
              hasMore={hasMore}
              loader={
                (courses?.length || 0) >= 20 &&
                hasMore && (
                  <div className='mt-4 text-center'>
                    <Spinner />
                  </div>
                )
              }
              next={fetchMore}
              style={{ overflowY: 'hidden' }}
            >
              <div className='mx-auto flex flex-col'>
                {courses?.map((course, i) => (
                  <CourseCard key={i} course={course} className='m-2' />
                ))}
                {!hasMore ? (
                  courses?.length ? (
                    <div className='mx-[200px] mt-4 text-center'>
                      <p className='text-gray-500 dark:text-gray-400'>
                        No more courses to show
                      </p>
                    </div>
                  ) : (
                    <div className='mt-4 text-center'>
                      <Spinner />
                    </div>
                  )
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
