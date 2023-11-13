import { Index } from 'flexsearch';
import _ from 'lodash';

import data from '../assets/searchData.json';
import { Course } from '../model/Course';
import { Instructor } from '../model/Instructor';
import type { SearchResults } from '../model/SearchResults';

let coursesIndex: Index | null = null;
let instructorsIndex: Index | null = null;

export type CourseData = Pick<
  Course,
  '_id' | 'subject' | 'title' | 'code' | 'instructors'
>;

export const getSearchIndex = () => {
  const courses = data as CourseData[];
  const instructors: Instructor[] = _.uniqBy(
    courses.flatMap((course: CourseData) => course.instructors),
    (instructor: Instructor) => instructor.name
  );

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

    instructors.forEach((instructor, i) =>
      instructorsIndex?.add(i, instructor.name)
    );
  }

  return { courses, instructors, coursesIndex, instructorsIndex };
};

export const updateSearchResults = (
  query: string,
  courses: CourseData[],
  instructors: Instructor[],
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
