import { twMerge } from 'tailwind-merge';

import finalExamsData from '../assets/final-exams.json';
import { getCurrentTerm } from '../lib/utils';
import type { Course } from '../model/course';

type RawFinalExam = {
  id: string;
  section?: string;
  exam: {
    format?: string | null;
    type?: string | null;
    location?: string | null;
  };
  start_time?: string | null;
  end_time?: string | null;
};

type FinalExamTerm = {
  term: string;
  exams: RawFinalExam[];
};

const finalExams = finalExamsData as FinalExamTerm[];

const parseDate = (value?: string | null) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateLabel = (start: Date | null) => {
  if (!start) return 'Date TBA';

  return new Intl.DateTimeFormat('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(start);
};

const formatTimeLabel = (start: Date | null, end: Date | null) => {
  if (!start && !end) return 'Time TBA';

  const formatTimePart = (date: Date | null) => {
    if (!date) return null;

    const formatted = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
      .format(date)
      .toUpperCase();

    const withoutMinutes = formatted.includes(':00')
      ? formatted.replace(':00', '')
      : formatted;

    return withoutMinutes.replace(/\s+/g, '');
  };

  const startLabel = formatTimePart(start);
  const endLabel = formatTimePart(end);

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`;
  }

  return startLabel ?? endLabel ?? 'Time TBA';
};

const sortExams = (exams: RawFinalExam[]): RawFinalExam[] => {
  const toSortable = (value?: string | null) => value ?? '';
  const compareSections = (a?: string, b?: string) =>
    toSortable(a).localeCompare(toSortable(b), undefined, {
      numeric: true,
      sensitivity: 'base',
    });

  return exams.slice().sort((a, b) => {
    const aStart = toSortable(a.start_time);
    const bStart = toSortable(b.start_time);

    if (aStart && bStart) {
      const cmp = aStart.localeCompare(bStart);
      if (cmp !== 0) return cmp;
    } else if (aStart) {
      return -1;
    } else if (bStart) {
      return 1;
    }

    return compareSections(a.section, b.section);
  });
};

type FinalExamRowProps = {
  course: Course;
  className?: string;
};

export const FinalExamRow = ({ course, className }: FinalExamRowProps) => {
  const currentTerm = getCurrentTerm();
  const termEntry = finalExams.find((entry) => entry.term === currentTerm);

  if (!termEntry) return null;

  const courseExams = termEntry.exams.filter((exam) => exam.id === course._id);

  if (courseExams.length === 0) return null;

  const exams = sortExams(courseExams);
  const sectionCount = courseExams.reduce((acc, exam) => {
    if (exam.section) acc.add(exam.section);
    return acc;
  }, new Set<string>()).size;
  const headerDetail =
    sectionCount > 0
      ? `${sectionCount} ${sectionCount === 1 ? 'section' : 'sections'} scheduled`
      : 'Schedule published';

  return (
    <div
      className={twMerge(
        'rounded-md bg-slate-50 p-4 shadow-sm dark:bg-neutral-800',
        className
      )}
    >
      <div className='flex flex-wrap items-baseline justify-between gap-2'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Final Exam
          </p>
          <p className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {currentTerm}
          </p>
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          {headerDetail}
        </p>
      </div>

      <div className='mt-3 flex flex-col gap-3'>
        {exams.map((exam) => {
          const start = parseDate(exam.start_time);
          const end = parseDate(exam.end_time);
          const detailParts = [
            exam.section ? `Section ${exam.section}` : null,
            exam.exam.location ?? null,
            exam.exam.type ?? null,
            exam.exam.format ?? null,
          ].filter(Boolean) as string[];

          return (
            <div
              key={[
                exam.id,
                exam.section ?? '',
                exam.start_time ?? '',
                exam.end_time ?? '',
              ].join('|')}
              className='flex flex-col gap-3 rounded-md border border-slate-200/70 bg-white/70 p-3 text-sm text-gray-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-gray-200 sm:flex-row sm:items-center sm:justify-between'
            >
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {formatDateLabel(start)}
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  {formatTimeLabel(start, end)}
                </p>
              </div>
              {detailParts.length > 0 && (
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  {detailParts.join(' • ')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
