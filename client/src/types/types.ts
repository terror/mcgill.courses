export type Course = {
  title: string;
  credits: string;
  subject: string;
  code: string;
  level: string;
  url: string;
  department: string;
  faculty: string;
  facultyUrl: string;
  terms: string[];
  description: string;
  instructors: Instructor[];
  prerequisites: string[];
  corequisites: string[];
  schedule: Schedule[];
};

export type Instructor = {
  name: string;
  term: string;
};

export type Schedule = {
  campus?: string;
  display?: string;
  location?: string;
};
