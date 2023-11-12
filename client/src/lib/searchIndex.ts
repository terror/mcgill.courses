import Index from 'flexsearch';
import _ from 'lodash';

import data from '../../../seed/courses-2023-2024.json';
import { Course } from '../model/Course';
import { Instructor } from '../model/Instructor';
import type { SearchResults } from '../model/SearchResults';

export const loadSearchIndex = () => {
  const courses: Course[] = data as Course[];
  const instructors: Instructor[] = _.uniqBy(
    courses.flatMap((course: Course) => course.instructors),
    (instructor: Instructor) => instructor.name
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

  return { courses, instructors, coursesIndex, instructorsIndex };
};

export const updateSearchResults = (
  query: string,
  courses: Course[],
  instructors: Instructor[],
  coursesIndex: Index,
  instructorsIndex: Index,
  setResults: (_: SearchResults) => void
) => {
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
