import { Index } from 'flexsearch';
import { describe, expect, it } from 'vitest';

import type { CourseData } from './search-index';
import { getRankedCourses } from './search-index';

const courses: CourseData[] = [
  {
    _id: 'MATH203',
    subject: 'MATH',
    title: 'Principles of Statistics 1',
    code: '203',
  },
  {
    _id: 'MATH204',
    subject: 'MATH',
    title: 'Principles of Statistics 2',
    code: '204',
  },
  {
    _id: 'MATH222',
    subject: 'MATH',
    title: 'Calculus 3',
    code: '222',
  },
  {
    _id: 'CHEM367',
    subject: 'CHEM',
    title: 'Instrumental Analysis 1',
    code: '367',
  },
  {
    _id: 'MATH242',
    subject: 'MATH',
    title: 'Analysis 1',
    code: '242',
  },
  {
    _id: 'COMP505',
    subject: 'COMP',
    title: 'Advanced Computer Architecture',
    code: '505',
  },
  {
    _id: 'COMP550',
    subject: 'COMP',
    title: 'Natural Language Processing',
    code: '550',
  },
];

const createIndex = () => {
  const index = new Index({ tokenize: 'forward' });

  courses.forEach((course, i) => {
    index.add(
      i,
      `${course._id} ${course.subject} ${course.title} ${course.code}`
    );
  });

  return index;
};

const search = (query: string) =>
  getRankedCourses(query, courses, createIndex())[0]._id;

describe('getRankedCourses', () => {
  it('prioritizes exact subject and code matches', () => {
    expect(search('math 222')).toBe('MATH222');
  });

  it('prefers exact title matches over partial matches', () => {
    expect(search('analysis 1')).toBe('MATH242');
  });

  it('keeps exact course ids on top even when numeric tokens overlap', () => {
    expect(search('comp 550')).toBe('COMP550');
  });

  it('still prioritizes the primary course when searching by title prefix only', () => {
    expect(search('analysis')).toBe('MATH242');
  });

  it('handles mixed casing and punctuation in queries', () => {
    expect(search('Comp-550')).toBe('COMP550');
  });

  it('keeps numeric only queries anchored to the matching course code', () => {
    expect(search('222')).toBe('MATH222');
  });

  it('returns the earliest subject match when only the subject is provided', () => {
    expect(search('math')).toBe('MATH203');
  });
});
