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
    instructors: [],
  },
  {
    _id: 'MATH204',
    subject: 'MATH',
    title: 'Principles of Statistics 2',
    code: '204',
    instructors: [],
  },
  {
    _id: 'MATH222',
    subject: 'MATH',
    title: 'Calculus 3',
    code: '222',
    instructors: [],
  },
  {
    _id: 'CHEM367',
    subject: 'CHEM',
    title: 'Instrumental Analysis 1',
    code: '367',
    instructors: [],
  },
  {
    _id: 'MATH242',
    subject: 'MATH',
    title: 'Analysis 1',
    code: '242',
    instructors: [],
  },
  {
    _id: 'COMP505',
    subject: 'COMP',
    title: 'Advanced Computer Architecture',
    code: '505',
    instructors: [],
  },
  {
    _id: 'COMP550',
    subject: 'COMP',
    title: 'Natural Language Processing',
    code: '550',
    instructors: [],
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

describe('getRankedCourses', () => {
  it('prioritizes exact subject and code matches', () => {
    const results = getRankedCourses('math 222', courses, createIndex());

    expect(results[0]?._id).toBe('MATH222');
  });

  it('prefers exact title matches over partial matches', () => {
    const results = getRankedCourses('analysis 1', courses, createIndex());

    expect(results[0]?._id).toBe('MATH242');
  });

  it('keeps exact course ids on top even when numeric tokens overlap', () => {
    const results = getRankedCourses('comp 550', courses, createIndex());

    expect(results[0]?._id).toBe('COMP550');
  });
});
