import _ from 'lodash';
import { useEffect, useState } from 'react';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';

import * as buildingCodes from '../assets/buildingCodes.json';
import { mod, sortTerms } from '../lib/utils';
import { Course } from '../model/Course';
import { Block, Schedule, TimeBlock } from '../model/Schedule';
import { Tooltip } from './Tooltip';

const TIMESLOT_HEIGHT = 20;
const HEIGHT_FACTOR = (TIMESLOT_HEIGHT * 2) / 60;

const vsbDays: Record<string, string> = {
  '1': 'Sun',
  '2': 'Mon',
  '3': 'Tue',
  '4': 'Wed',
  '5': 'Thu',
  '6': 'Fri',
  '7': 'Sat',
};

const convertVsbTime = (t: string) => {
  return parseInt(t, 10);
};

const vsbTimeToDisplay = (time: string) => {
  const approxTimeOfTheDay = parseInt(time, 10) / 60;
  const hour = Math.floor(approxTimeOfTheDay);
  const minute = Math.round((approxTimeOfTheDay - hour) * 60);

  return `${hour.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })}:${minute.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })}
  `;
};

const BlockLocation = ({ location }: { location: string }) => {
  const room = location.split(' ')[0];

  return (
    <span className='relative whitespace-nowrap'>
      <Tooltip text={buildingCodes[room as keyof typeof buildingCodes]}>
        <p className='inline-block cursor-default font-medium'> {location}</p>
      </Tooltip>
    </span>
  );
};

type TimeblockCardProps = {
  hour: number;
  timeblock: TimeBlock;
  block: Block;
};

const TimeblockCard = ({ hour, timeblock, block }: TimeblockCardProps) => {
  const t1 = convertVsbTime(timeblock.t1);
  const t2 = convertVsbTime(timeblock.t2);
  return (
    <div
      className='absolute left-1/2 top-0 z-10 w-[95%] -translate-x-1/2 rounded-md bg-red-100 p-1'
      style={{
        marginTop: (t1 - hour * 60) * HEIGHT_FACTOR,
        height: (t2 - t1) * HEIGHT_FACTOR,
      }}
    >
      <div>
        <div className='text-sm font-semibold text-red-800'>
          {block.display}
        </div>
        <div className='text-sm text-red-800'>
          {vsbTimeToDisplay(timeblock.t1)} - {vsbTimeToDisplay(timeblock.t2)}
        </div>
      </div>
    </div>
  );
};

type ScheduleDayProps = {
  day: string;
  block: Block;
};

const timeRange = _.range(8, 18);

const ScheduleDay = ({ day, block }: ScheduleDayProps) => {
  const timeblocks = block.timeblocks.filter((b) => b.day === day);

  return (
    <div className='col-span-1'>
      <div
        className='border border-l-0 border-t-0 text-center text-sm text-gray-500'
        key={day}
      >
        {vsbDays[day]}
      </div>
      {timeRange.map((t) => {
        let tb: TimeBlock | undefined = undefined;
        const blockIndex = timeblocks.findIndex((b) => {
          const time = convertVsbTime(b.t1);
          return time >= t * 60 && time <= (t + 1) * 60;
        });

        if (blockIndex !== -1) {
          tb = timeblocks[blockIndex];
          timeblocks.splice(blockIndex);
        }

        return (
          <div className='relative' key={`day-${day}-time-${t}`}>
            <div className='border' style={{ height: TIMESLOT_HEIGHT }} />
            <div
              className='border-x border-b'
              style={{ height: TIMESLOT_HEIGHT }}
            />
            {tb && <TimeblockCard hour={t} timeblock={tb} block={block} />}
          </div>
        );
      })}
    </div>
  );
};

type VisualScheduleProps = {
  course: Course;
};

const getTermBlocks = (schedules: Schedule[]) => {
  const terms: Record<string, Block[]> = {};
  for (const schedule of schedules) {
    if (terms[schedule.term] === undefined) {
      terms[schedule.term] = [];
    }
    // TODO: Fix issue with courses like CHEM 120 that group together a lec and lab for blocks (don't flatten)
    terms[schedule.term]?.push(...schedule.blocks);
  }

  for (const term of Object.keys(terms)) {
    terms[term] = _.sortBy(
      _.uniqBy(terms[term], (b) => b.display),
      (b) => b.display
    );
  }

  return terms;
};

export const VisualSchedule = ({ course }: VisualScheduleProps) => {
  if (!course.schedule) return null;

  const terms = getTermBlocks(course.schedule);
  const offeredTerms = sortTerms(Object.keys(terms));

  const [term, setTerm] = useState(offeredTerms[0]);
  const [blockIndex, setBlockIndex] = useState(0);

  useEffect(() => {
    setTerm(offeredTerms[0]);
    setBlockIndex(0);
  }, [course]);

  const handleTermClick = (t: string) => {
    return () => {
      setTerm(t);
      setBlockIndex(0);
    };
  };

  if (!(term in terms)) return null;

  const updateIndex = (n: number) => {
    return () => {
      setBlockIndex(mod(blockIndex + n, terms[term].length));
    };
  };

  const block = terms[term][blockIndex];

  if (!block) {
    return null;
  }

  return (
    <div className='mt-4 w-full overflow-hidden rounded-lg bg-slate-50 shadow-sm'>
      <div className='flex w-full border-b'>
        {Object.keys(terms).map((t) => (
          <div
            className={twMerge(
              'flex-1 p-2 text-center transition duration-200 cursor-pointer',
              t === term ? 'bg-slate-200' : 'hover:bg-gray-100'
            )}
            onClick={handleTermClick(t)}
            key={t}
          >
            {t}
          </div>
        ))}
      </div>
      <div className='flex gap-x-6 px-6 py-3'>
        <div className='flex items-center gap-x-2'>
          <LuArrowLeft
            size={20}
            className='cursor-pointer'
            onClick={updateIndex(-1)}
          />
          <div className='font-medium'>{block.display}</div>
          <LuArrowRight
            size={20}
            className='cursor-pointer'
            onClick={updateIndex(1)}
          />
        </div>
        <div>{block.campus}</div>
        <span className='inline-block font-medium'>
          {((split) =>
            split.map((location: string, index) => (
              <span key={index}>
                <BlockLocation location={location.trim()} />
                {index !== split.length - 1 && (
                  <span className='inline-block'>, </span>
                )}
              </span>
            )))(block.location.split(';'))}
        </span>
      </div>
      <div className='grid grid-cols-[40px_repeat(5,minmax(0,1fr))] p-6'>
        <div className='col-span-1'>
          <div className='mt-4' />
          {timeRange.map((h) => (
            <div
              className='mr-2 text-right text-xs text-gray-500'
              style={{ height: TIMESLOT_HEIGHT * 2 }}
              key={`time-${h}`}
            >
              {h}:00
            </div>
          ))}
        </div>
        {['2', '3', '4', '5', '6'].map((day) => (
          <ScheduleDay day={day} block={block} key={`day-${day}`} />
        ))}
      </div>
    </div>
  );
};
