import type { CourseData, InstructorName } from '../lib/search-index';

export type SearchResults = {
  query?: string;
  courses: CourseData[];
  instructors: InstructorName[];
};
