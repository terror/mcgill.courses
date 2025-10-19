import { CalendarPlus, Dot } from 'lucide-react';
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
  url?: string | null;
  exams: RawFinalExam[];
};

type GroupedExam = {
  key: string;
  start_time?: string | null;
  end_time?: string | null;
  exam: RawFinalExam['exam'];
  sections: string[];
};

const finalExams = finalExamsData as FinalExamTerm[];

const ICS_TIMEZONE = 'America/Toronto';

const padNumber = (value: number) => value.toString().padStart(2, '0');

const formatIcsDateTime = (date: Date) =>
  [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
    'T',
    padNumber(date.getHours()),
    padNumber(date.getMinutes()),
    padNumber(date.getSeconds()),
  ].join('');

const formatIcsDateTimeUTC = (date: Date) =>
  [
    date.getUTCFullYear(),
    padNumber(date.getUTCMonth() + 1),
    padNumber(date.getUTCDate()),
    'T',
    padNumber(date.getUTCHours()),
    padNumber(date.getUTCMinutes()),
    padNumber(date.getUTCSeconds()),
    'Z',
  ].join('');

const escapeIcsText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

type IcsEventOptions = {
  start: Date;
  end?: Date | null;
  summary: string;
  description?: string;
  location?: string | null;
  url?: string | null;
  uid: string;
};

const buildIcsContent = ({
  start,
  end,
  summary,
  description,
  location,
  url,
  uid,
}: IcsEventOptions) => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//mcgill.courses//FinalExam//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDateTimeUTC(new Date())}`,
    `DTSTART;TZID=${ICS_TIMEZONE}:${formatIcsDateTime(start)}`,
  ];

  if (end) {
    lines.push(`DTEND;TZID=${ICS_TIMEZONE}:${formatIcsDateTime(end)}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(summary)}`);

  if (description) {
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  }

  if (location) {
    lines.push(`LOCATION:${escapeIcsText(location)}`);
  }

  if (url) {
    lines.push(`URL:${escapeIcsText(url)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
};

const downloadIcsFile = (filename: string, content: string) => {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: 'text/calendar' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
};

const sanitizeForFilename = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

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

const groupExams = (exams: RawFinalExam[]): GroupedExam[] => {
  const sectionComparator = (a: string, b: string) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

  const grouped: {
    key: string;
    start_time?: string | null;
    end_time?: string | null;
    exam: RawFinalExam['exam'];
    sections: Set<string>;
  }[] = [];

  const indexByKey = new Map<string, number>();

  exams.forEach((exam) => {
    const groupKey = [
      exam.id,
      exam.start_time ?? '',
      exam.end_time ?? '',
      exam.exam.location ?? '',
      exam.exam.type ?? '',
      exam.exam.format ?? '',
    ].join('|');

    const existingIndex = indexByKey.get(groupKey);
    const section = exam.section?.trim();

    if (existingIndex !== undefined) {
      if (section) {
        grouped[existingIndex].sections.add(section);
      }

      return;
    }

    const sections = new Set<string>();

    if (section) {
      sections.add(section);
    }

    grouped.push({
      key: groupKey,
      start_time: exam.start_time,
      end_time: exam.end_time,
      exam: exam.exam,
      sections,
    });

    indexByKey.set(groupKey, grouped.length - 1);
  });

  return grouped.map((entry) => ({
    key: entry.key,
    start_time: entry.start_time,
    end_time: entry.end_time,
    exam: entry.exam,
    sections: Array.from(entry.sections).sort(sectionComparator),
  }));
};

const renderDetailLine = (
  parts: string[],
  keyPrefix: string,
  className?: string
) => {
  if (parts.length === 0) return null;

  return (
    <div className={twMerge('flex flex-wrap items-center', className)}>
      {parts.map((part, index) => (
        <span key={`${keyPrefix}-${index}`} className='flex items-center'>
          {index > 0 && (
            <Dot className='h-6 w-6 flex-shrink-0 text-gray-400 dark:text-gray-500' />
          )}
          <span>{part}</span>
        </span>
      ))}
    </div>
  );
};

type FinalExamRowProps = {
  course: Course;
  className?: string;
};

export const FinalExamRow = ({ course, className }: FinalExamRowProps) => {
  const currentTerm = getCurrentTerm();

  const termEntry = finalExams.find((entry) => entry.term === currentTerm);

  if (!termEntry) {
    return null;
  }

  const courseExams = termEntry.exams.filter((exam) => exam.id === course._id);

  if (courseExams.length === 0) {
    return null;
  }

  const exams = sortExams(courseExams);

  const sectionCount = courseExams.reduce((acc, exam) => {
    if (exam.section) acc.add(exam.section);
    return acc;
  }, new Set<string>()).size;

  const groupedExams = groupExams(exams);

  const headerDetail =
    sectionCount > 0
      ? `${sectionCount} ${sectionCount === 1 ? 'section' : 'sections'} scheduled`
      : 'Schedule published';

  const highlightTarget =
    [course.subject, course.code].filter(Boolean).join(' ') ||
    course._id ||
    course.title;

  const encodedHighlight = encodeURIComponent(highlightTarget);

  const examScheduleUrl = termEntry.url
    ? `${termEntry.url}#:~:text=${encodedHighlight}`
    : undefined;

  const baseRowClassName =
    'flex flex-col gap-3 rounded-md border border-slate-200/70 bg-white/70 p-3 text-sm text-gray-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-gray-200 sm:flex-row sm:items-start sm:gap-6';

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
        {groupedExams.map((exam) => {
          const start = parseDate(exam.start_time);
          const end = parseDate(exam.end_time);

          const sectionLabel =
            exam.sections.length === 0
              ? null
              : `${exam.sections.length === 1 ? 'Section' : 'Sections'} ${exam.sections.join(', ')}`;

          const topLineParts = [sectionLabel].filter(Boolean) as string[];

          const bottomLineParts = [
            exam.exam.location ?? null,
            exam.exam.type ?? null,
            exam.exam.format ?? null,
          ].filter(Boolean) as string[];

          const key = exam.key;

          const dateLabel = formatDateLabel(start);
          const timeLabel = formatTimeLabel(start, end);

          const topLine = renderDetailLine(
            topLineParts,
            `${key}-top`,
            'text-sm text-gray-600 dark:text-gray-300 sm:col-start-2 sm:row-start-1'
          );
          const bottomLine = renderDetailLine(
            bottomLineParts,
            `${key}-bottom`,
            'text-sm text-gray-600 dark:text-gray-300 sm:col-start-2 sm:row-start-2'
          );

          const examIdentifier = [course.subject, course.code]
            .filter(Boolean)
            .join(' ')
            .trim();
          const summaryTitle = (
            examIdentifier
              ? `${examIdentifier} Final Exam`
              : `${course.title ?? 'Final Exam'}`
          ).trim();

          const descriptionParts = [
            course.title ? `Course: ${course.title}` : null,
            sectionLabel ? `Sections: ${exam.sections.join(', ')}` : null,
            `Date: ${dateLabel}`,
            `Time: ${timeLabel}`,
            exam.exam.location ? `Location: ${exam.exam.location}` : null,
            exam.exam.type ? `Type: ${exam.exam.type}` : null,
            exam.exam.format ? `Format: ${exam.exam.format}` : null,
            examScheduleUrl ? `Schedule: ${examScheduleUrl}` : null,
          ].filter(Boolean) as string[];

          const description =
            descriptionParts.length > 0
              ? descriptionParts.join('\n')
              : undefined;

          const filenameBase = sanitizeForFilename(
            [
              examIdentifier.replace(/\s+/g, '-') || undefined,
              'final-exam',
              currentTerm,
            ]
              .filter(Boolean)
              .join('-')
          );
          const filename = `${filenameBase || 'final-exam'}.ics`;

          const uid = `${(
            sanitizeForFilename(
              [
                course._id ?? '',
                exam.start_time ?? '',
                exam.end_time ?? '',
                currentTerm,
              ]
                .filter(Boolean)
                .join('-')
            ) ||
            sanitizeForFilename(key) ||
            'final-exam'
          ).slice(0, 64)}@mcgill.courses`;

          const handleAddToCalendar = () => {
            if (!start) return;

            const icsContent = buildIcsContent({
              start,
              end,
              summary: summaryTitle,
              description,
              location: exam.exam.location,
              url: examScheduleUrl,
              uid,
            });

            downloadIcsFile(filename, icsContent);
          };

          const addToCalendarButton = (
            <button
              type='button'
              onClick={handleAddToCalendar}
              disabled={!start}
              className='inline-flex items-center gap-1.5 self-start rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-gray-200 dark:hover:bg-neutral-900 sm:flex-none sm:self-start'
              aria-label='Add final exam to calendar'
              title={start ? 'Add to calendar' : 'Exam date coming soon'}
            >
              <CalendarPlus className='size-4' aria-hidden='true' />
            </button>
          );

          const infoContent = (
            <div className='grid w-full gap-x-6 gap-y-1 sm:grid-cols-[auto_minmax(0,1fr)]'>
              <span className='text-sm font-medium text-gray-900 dark:text-gray-100 sm:col-start-1 sm:row-start-1'>
                {dateLabel}
              </span>
              {topLine}
              <span className='text-sm text-gray-600 dark:text-gray-300 sm:col-start-1 sm:row-start-2'>
                {timeLabel}
              </span>
              {bottomLine}
            </div>
          );

          const linkedInfoContent = examScheduleUrl ? (
            <a
              href={examScheduleUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='block w-full focus-visible:outline-none'
            >
              {infoContent}
            </a>
          ) : (
            infoContent
          );

          const containerClasses = twMerge(
            baseRowClassName,
            examScheduleUrl
              ? 'transition-colors hover:border-slate-300 hover:bg-white dark:hover:border-neutral-600 dark:hover:bg-neutral-900'
              : ''
          );

          const rowLayoutClasses =
            'flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6';

          return (
            <div key={key} className={containerClasses}>
              <div className={rowLayoutClasses}>
                <div className='w-full'>{linkedInfoContent}</div>
                <div className='flex shrink-0 items-center sm:self-center'>
                  {addToCalendarButton}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
