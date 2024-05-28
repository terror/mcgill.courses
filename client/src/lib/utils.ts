import _ from 'lodash';

import { Course } from '../model/Course';
import { Instructor } from '../model/Instructor';
import type { Schedule } from '../model/Schedule';

export const groupCurrentCourseTermInstructors = (course: Course) => {
  const currentTerms = getCurrentTerms();

  const currentInstructors = course.instructors.filter((i) =>
    currentTerms.includes(i.term)
  );

  const termGroups = _.groupBy(currentInstructors, (i: Instructor) => i.term);

  for (const term of course.terms) {
    if (term in termGroups || !currentTerms.includes(term)) continue;
    termGroups[term] = [];
  }

  const entries = Object.entries(termGroups);

  return entries;
};

export const getCurrentTerms = (): [string, string, string] => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (month >= 5 && month < 8)
    return [`Summer ${year}`, `Fall ${year}`, `Winter ${year + 1}`];

  if (month >= 8)
    return [`Fall ${year}`, `Winter ${year + 1}`, `Summer ${year + 1}`];

  return [`Fall ${year - 1}`, `Winter ${year}`, `Summer ${year}`];
};

const TERM_ORDER = ['Winter', 'Summer', 'Fall'];

export const compareTerms = (a: string, b: string) => {
  return a.split(' ')[1] === b.split(' ')[1]
    ? TERM_ORDER.indexOf(a.split(' ')[0]) - TERM_ORDER.indexOf(b.split(' ')[0])
    : parseInt(a.split(' ')[1], 10) - parseInt(b.split(' ')[1], 10);
};

export const sortTerms = (terms: string[]) => {
  return terms.sort(compareTerms);
};

export const sortSchedulesByBlocks = (schedules: Schedule[]) => {
  const order = ['Lec', 'Lab', 'Seminar', 'Tut', 'Conf'];

  return schedules.sort((a, b) => {
    const aNum = parseInt(a.blocks[0].display.split(' ')[1], 10);
    const bNum = parseInt(b.blocks[0].display.split(' ')[1], 10);
    const aType = a.blocks[0].display.split(' ')[0];
    const bType = b.blocks[0].display.split(' ')[0];

    return aType === bType
      ? aNum - bNum
      : order.indexOf(aType) - order.indexOf(bType);
  });
};

export const getUrl = (): string => import.meta.env.VITE_API_URL ?? '';

export const courseIdToUrlParam = (courseId: string) =>
  `${courseId.slice(0, 4)}-${courseId.slice(4)}`.toLowerCase();

export const capitalize = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const punctuate = (s: string): string =>
  s.charAt(s.length - 1) === '.' ? s : s + '.';

export const isValidCourseCode = (s: string) =>
  /^(([A-Z0-9]){4} [0-9]{3}(D1|D2|N1|N2|J1|J2|J3)?)$/.test(s);

export const spliceCourseCode = (courseCode: string, delimiter: string) =>
  courseCode.slice(0, 4) + delimiter + courseCode.slice(4);

export const round2Decimals = (n: number) => Math.round(n * 100) / 100;

export const mod = (n: number, m: number) => ((n % m) + m) % m;

export const timeSince = (date: Date) => {
  const seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + ' years ago';

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + ' months ago';

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + ' days ago';

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + ' hours ago';

  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + ' minutes ago';

  return Math.floor(seconds) + ' seconds ago';
};
