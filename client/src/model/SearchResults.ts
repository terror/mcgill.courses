import { Course } from './Course';
import { Instructor } from './Instructor';

export type SearchResults = {
  query?: string;
  courses: Course[];
  instructors: Instructor[];
};
