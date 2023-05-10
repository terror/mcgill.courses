import { Course } from '../model/Course';
import { Instructor } from '../model/Instructor';
import { Block } from '../model/Schedule';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const uniqueTermInstructors = (course: Course) => {
  const termInstructors = course.instructors.filter((i) =>
    course.terms.includes(i.term)
  );

  const unique = [];
  const filledTerms = new Set();

  for (const instructor of termInstructors) {
    if (!filledTerms.has(instructor.term)) {
      unique.push(instructor);
      filledTerms.add(instructor.term);
    }
  }

  const order = ['Fall', 'Winter', 'Summer'];

  for (const term of course.terms) {
    if (!filledTerms.has(term)) {
      unique.push({ term, name: 'No Instructor Assigned' });
    }
  }

  unique.sort((a, b) => order.indexOf(a.term) - order.indexOf(b.term));

  return unique;
};

export const getCurrentTerm = (): [string, string, string] => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (month >= 8)
    return [`Fall ${year}`, `Winter ${year + 1}`, `Summer ${year + 1}`];

  return [`Fall ${year - 1}`, `Winter ${year}`, `Summer ${year}`];
};

export const filterCurrentInstructors = (instructors: Instructor[]) => {
  const currentTerm = getCurrentTerm();
  return instructors.filter((i) => currentTerm.includes(i.term));
};

export const dedupe = (arr: any[]) => {
  return [...new Set(arr)];
};

export const sortTerms = (terms: string[]) => {
  const order = ['Summer', 'Fall', 'Winter'];
  return terms.sort((a, b) => {
    return a.split(' ')[1] === b.split(' ')[1]
      ? order.indexOf(a.split(' ')[0]) - order.indexOf(b.split(' ')[0])
      : parseInt(a.split(' ')[1], 10) - parseInt(b.split(' ')[1], 10);
  });
};

export const sortBlocks = (blocks: Block[]) => {
  const campusOrder = ['Downtown', 'Macdonald'];

  return blocks.sort((a, b) => {
    const aLec = parseInt(a.display.split(' ')[1], 10);
    const bLec = parseInt(b.display.split(' ')[1], 10);

    if (aLec === bLec) {
      return campusOrder.indexOf(a.campus) - campusOrder.indexOf(b.campus);
    }

    return aLec - bLec;
  });
};
