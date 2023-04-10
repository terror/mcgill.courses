import { Course } from './Course';

export type SearchResults = {
  query: string;
  courses: Course[];
};
