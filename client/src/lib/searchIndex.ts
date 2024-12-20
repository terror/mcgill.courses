import { Index } from 'flexsearch';

import data from '../assets/searchData.json';
import { Course } from '../model/Course';
import type { SearchResults } from '../model/SearchResults';

let coursesIndex: Index | null = null;
let instructorsIndex: Index | null = null;

export type CourseData = Pick<
  Course,
  '_id' | 'subject' | 'title' | 'code' | 'instructors'
>;

export type InstructorName = string;

export const getSearchIndex = () => {
  const courses = data.courses as CourseData[];
  const instructors = data.instructors as InstructorName[];

  if (coursesIndex === null) {
    coursesIndex = new Index({
      tokenize: 'forward',
    });

    courses.forEach((course, i) =>
      coursesIndex?.add(
        i,
        `${course._id} ${course.subject} ${course.title} ${course.code}`
      )
    );
  }

  if (instructorsIndex === null) {
    instructorsIndex = new Index({
      tokenize: 'forward',
    });

    instructors.forEach((instructorName, i) =>
      instructorsIndex?.add(i, instructorName)
    );
  }

  return { courses, instructors, coursesIndex, instructorsIndex };
};

export const updateSearchResults = (
  query: string,
  courses: CourseData[],
  instructors: InstructorName[],
  coursesIndex: Index,
  instructorsIndex: Index,
  setResults: (_: SearchResults) => void
) => {
  const courseSearchResults = coursesIndex
    .search(query, 4)
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
