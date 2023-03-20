import { Instructor } from './Instructor';
import { Schedule } from './Schedule';

export type Course = {
  title: string;
  credits: string;
  subject: string;
  code: string;
  level: string;
  url: string;
  department: string;
  faculty: string;
  faculty_url: string;
  terms: string[];
  description: string;
  instructors: Instructor[];
  prerequisites: string[];
  corequisites: string[];
  schedule: Schedule[];
};
