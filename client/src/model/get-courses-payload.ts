import { Course } from './course';

export type GetCoursesPayload = {
  courses: Course[];
  courseCount?: number;
};
