import _ from 'lodash';
import { useEffect, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { twMerge } from 'tailwind-merge';

import * as buildingCodes from '../assets/buildingCodes.json';
import { sortSchedulesByBlocks, sortTerms } from '../lib/utils';
import type { Course } from '../model/Course';
import type { Block, Schedule, TimeBlock } from '../model/Schedule';
import { Tooltip } from './Tooltip';

const dayToWeekday = (day: string) => {
  switch (day) {
    case '1':
      return 'Sunday';
    case '2':
      return 'Monday';
    case '3':
      return 'Tuesday';
    case '4':
      return 'Wednesday';
    case '5':
      return 'Thursday';
    case '6':
      return 'Friday';
    case '7':
      return 'Saturday';
    default:
      throw new Error('Invalid day');
  }
};

const VSBtimeToDisplay = (time: string) => {
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

type SchedulesDisplayProps = {
  course: Course;
  className?: string;
};

const BlockLocation = ({ location }: { location: string }) => {
  const room = location.split(' ')[0];

  return (
    <span className='relative whitespace-nowrap'>
      <Tooltip text={buildingCodes[room as keyof typeof buildingCodes]}>
        <p className='inline-block cursor-default'> {location}</p>
      </Tooltip>
    </span>
  );
};

export const SchedulesDisplay = ({
  course,
  className,
}: SchedulesDisplayProps) => {
  const schedules = course.schedule;

  if (!schedules) return null;

  const offeredTerms = sortTerms(
    _.uniq(schedules.map((schedule) => schedule.term))
  );

  const [currrentlyDisplayingCourse, setCurrentlyDisplayingCourse] =
    useState<string>(course._id);

  const [currentlyDisplayingTerm, setCurrentlyDisplayingTerm] =
    useState<string>(offeredTerms[0]);

  const [currentlyDisplayingSchedules, setCurrentlyDisplayingSchedules] =
    useState<Schedule[]>(
      schedules.filter((schedule) => schedule.term === currentlyDisplayingTerm)
    );

  const [openBlock, setOpenBlock] = useState<Block | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (currrentlyDisplayingCourse !== course._id) {
    setCurrentlyDisplayingCourse(course._id);
    setCurrentlyDisplayingTerm(offeredTerms[0]);
  }

  useEffect(() => {
    const temp = schedules.filter(
      (schedule) => schedule.term === currentlyDisplayingTerm
    );

    const uniqueTimeSlots: Schedule[] = [];

    for (const schedule of temp) {
      for (const block of schedule.blocks) {
        uniqueTimeSlots.push({
          ...schedule,
          blocks: [block],
        });
      }
    }

    const uniqueByBlocks = _.uniqBy(
      uniqueTimeSlots,
      (t) => t.blocks[0].display
    );

    setCurrentlyDisplayingSchedules(sortSchedulesByBlocks(uniqueByBlocks));
    setOpenBlock(null);
  }, [currentlyDisplayingTerm]);

  if (offeredTerms.length === 0) {
    return null;
  }

  const maxDisplayLength =
    _.max(schedules.flatMap((s) => s.blocks.map((b) => b.display.length))) ?? 0;
  const displayWidth = maxDisplayLength * 9;

  const singleScheduleRow = (schedule: Schedule, scheduleIndex: number) => (
    <div key={scheduleIndex}>
      {schedule.blocks?.map((block: Block, blockIndex) => (
        <div key={blockIndex} className='flex flex-col'>
          <div
            className={twMerge(
              'flex flex-row justify-between border-t border-neutral-200 p-2 px-3 pl-5 dark:border-neutral-600'
            )}
          >
            <div className='flex flex-row flex-wrap whitespace-pre-wrap text-left md:flex-row'>
              <div className='font-medium' style={{ width: displayWidth }}>
                {block.display}
              </div>
              <div className='mx-4 font-normal text-gray-700 dark:text-gray-300'>
                {block.campus}
              </div>
              <div>
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
            </div>
            <button
              onClick={() =>
                openBlock !== block ? setOpenBlock(block) : setOpenBlock(null)
              }
            >
              <IoIosArrowDown
                className={twMerge(
                  openBlock === block ? 'rotate-180 transform' : '',
                  'mx-2 h-5 w-5 text-gray-900 dark:text-gray-300'
                )}
              />
            </button>
          </div>
          <div
            className='overflow-y-hidden transition-all duration-300 ease-in-out'
            style={{
              height:
                openBlock === block
                  ? Math.max(block.timeblocks.length * 40, 40)
                  : 0,
              opacity: openBlock === block ? 1 : 0,
            }}
          >
            {openBlock && openBlock === block && (
              <div className='flex flex-col'>
                {block.timeblocks.length > 0 ? (
                  block.timeblocks?.map((timeblock: TimeBlock, i) => (
                    <div
                      key={i}
                      className='flex flex-row justify-between px-3 py-2 pl-5 font-medium text-gray-600 dark:text-neutral-300'
                    >
                      <p>{dayToWeekday(timeblock.day)}</p>
                      <p className='pr-2'>
                        {VSBtimeToDisplay(timeblock.t1)} -{' '}
                        {VSBtimeToDisplay(timeblock.t2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className='flex flex-col'>
                    <div className='flex flex-row justify-center rounded-b-md px-3 py-2 dark:bg-neutral-700 dark:text-neutral-400'>
                      <p>No scheduled time block.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={twMerge(
        'flex flex-col text-gray-800 shadow-sm lg:border-t-0',
        className
      )}
    >
      <div className='flex'>
        {offeredTerms.map((term, i) => (
          <button
            key={i}
            className={twMerge(
              `flex-1 cursor-pointer p-2 text-center font-medium transition duration-300 ease-in-out dark:text-gray-200`,
              term === currentlyDisplayingTerm
                ? 'bg-slate-200 dark:bg-neutral-600'
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
              i === 0 ? 'rounded-tl-lg' : '',
              i === offeredTerms.length - 1 ? 'rounded-tr-lg' : ''
            )}
            onClick={() => {
              setCurrentlyDisplayingTerm(term);
              setShowAll(false);
            }}
          >
            {term}
          </button>
        ))}
      </div>
      <div className='flex flex-col rounded-b-lg bg-slate-50 dark:bg-neutral-700 dark:text-gray-200'>
        {currentlyDisplayingSchedules.length <= 5 || showAll
          ? currentlyDisplayingSchedules.map(singleScheduleRow)
          : currentlyDisplayingSchedules.slice(0, 5).map(singleScheduleRow)}
        {currentlyDisplayingSchedules.length > 5 && (
          <div className='flex flex-row justify-center'>
            <button
              className='flex flex-row items-center justify-center py-2 text-center font-medium transition duration-300 ease-in-out hover:cursor-pointer dark:text-gray-200'
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show less' : 'Show all'}
              <IoIosArrowDown
                className={`${
                  showAll ? 'rotate-180' : ''
                } mx-2 h-5 w-5 text-gray-900 dark:text-gray-300`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
