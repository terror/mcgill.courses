import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Skeleton from 'react-loading-skeleton';
import { toast } from 'sonner';

import { CourseCard } from '../components/CourseCard';
import { ExploreFilter } from '../components/ExploreFilter';
import { FilterToggle } from '../components/FilterToggle';
import { JumpToTopButton } from '../components/JumpToTopButton';
import { Layout } from '../components/Layout';
import { Spinner } from '../components/Spinner';
import { useDarkMode } from '../hooks/useDarkMode';
import { repo } from '../lib/repo';
import { getCurrentTerms } from '../lib/utils';
import { Course } from '../model/Course';

export const Explore = () => {
  const limit = 20;
  const currentTerms = getCurrentTerms();

  const [courses, setCourses] = useState<Course[] | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(limit);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

  const [darkMode] = useDarkMode();

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
    repo
      .getCourses(limit, 0, filters)
      .then((data) => setCourses(data))
      .catch(() => {
        toast.error('Failed to fetch courses. Please try again later.');
      });
    setHasMore(true);
    setOffset(limit);
  }, [selectedSubjects, selectedLevels, selectedTerms]);

  const fetchMore = async () => {
    const batch = await repo.getCourses(limit, offset, filters);

    if (batch.length === 0) setHasMore(false);
    else {
      setCourses(courses?.concat(batch));
      setOffset(offset + limit);
    }
  };

  return (
    <Layout>
      <div className='p-4'>
        <div className='flex flex-col items-center py-8'>
          <h1 className='mb-16 text-center text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-200 sm:text-5xl'>
            Explore all courses
          </h1>
          <div className='relative flex w-full max-w-xl flex-col lg:max-w-6xl lg:flex-row lg:justify-center'>
            <div className='mx-2 lg:hidden'>
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
            <div className='lg:flex-1'>
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
                <div className='ml-auto flex w-full max-w-xl flex-col'>
                  {courses ? (
                    courses.map((course, i) => (
                      <CourseCard key={i} course={course} className='m-2' />
                    ))
                  ) : (
                    <div className='mx-2'>
                      <Skeleton
                        baseColor={
                          darkMode ? 'rgb(38 38 38)' : 'rgb(248 250 252)'
                        }
                        className='first:mt-2 mb-2 rounded-lg'
                        count={10}
                        duration={2}
                        height={256}
                        highlightColor={
                          darkMode ? 'rgb(64 64 64)' : 'rgb(226 232 240)'
                        }
                      />
                    </div>
                  )}
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
            </div>
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
