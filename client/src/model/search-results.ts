import type { CourseData, InstructorName } from '../lib/searchIndex';

export type SearchResults = {
  query?: string;
  courses: CourseData[];
  instructors: InstructorName[];
};
