import { Course } from './Course';

export type GetCoursesPayload = {
  courses: Course[];
  courseCount?: number;
};
