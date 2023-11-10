import type { Course } from './Course';
import type { Instructor } from './Instructor';

export type SearchResults = {
  query?: string;
  courses: Course[];
  instructors: Instructor[];
};
