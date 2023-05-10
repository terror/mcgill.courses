import { useEffect, useState } from 'react';
import { TimeBlock, Block, Schedule } from '../model/Schedule';
import { dedupe, sortTerms, sortBlocks, classNames } from '../lib/utils';
import { IoIosArrowDown } from 'react-icons/io';
import { Transition } from '@headlessui/react';
import { Course } from '../model/Course';

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

export const SchedulesDisplay = ({ course }: { course: Course }) => {
  const schedules = course.schedule;

  const offeredTerms = sortTerms(
    dedupe(schedules.map((schedule) => schedule.term))
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

  if (currrentlyDisplayingCourse !== course._id) {
    setCurrentlyDisplayingCourse(course._id);
    setCurrentlyDisplayingTerm(offeredTerms[0]);
  }

  useEffect(() => {
    setCurrentlyDisplayingSchedules(
      schedules.filter((schedule) => schedule.term === currentlyDisplayingTerm)
    );
  }, [schedules, currentlyDisplayingTerm]);

  const handleClick = (term: string) => {
    setCurrentlyDisplayingTerm(term);
    setCurrentlyDisplayingSchedules(
      schedules.filter((schedule) => schedule.term === term)
    );
  };

  return offeredTerms.length !== 0 ? (
    <div className='flex flex-col text-gray-800'>
      <div className='mx-8 mt-4 flex '>
        {offeredTerms.map((term, i) => (
          <button
            key={i}
            className={classNames(
              `flex-1 py-2 text-center font-medium transition duration-300 ease-in-out hover:cursor-pointer dark:text-gray-200`,
              term === currentlyDisplayingTerm
                ? 'bg-neutral-100 dark:bg-neutral-700'
                : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700',
              i === 0 ? 'rounded-tl-lg' : '',
              i === offeredTerms.length - 1 ? 'rounded-tr-lg' : ''
            )}
            onClick={() => handleClick(term)}
          >
            {term}
          </button>
        ))}
      </div>
      <div className='mx-8 flex flex-col rounded-b-lg bg-neutral-100 dark:bg-neutral-700 dark:text-gray-200'>
        {currentlyDisplayingSchedules.map((schedule: Schedule, i) => (
          <div key={i}>
            {sortBlocks(schedule.blocks)?.map((block: Block, i) => (
              <div key={i} className='flex flex-col'>
                <div
                  className={classNames(
                    'flex flex-row justify-between border-t border-neutral-200 p-2 px-3 dark:border-neutral-600'
                  )}
                >
                  <div className='flex flex-wrap gap-x-3 whitespace-pre-wrap text-left'>
                    <div className='w-20 '>
                      <span className='font-semibold'>{block.display}</span>
                    </div>
                    <div className='w-44'>
                      <span className='font-semibold'>Campus: </span>
                      {block.campus}
                    </div>
                    <div className='w-56'>
                      <span className='font-semibold'>Classroom(s): </span>

                      {block.location
                        ? block.location.replace(';', ',')
                        : 'N/A'}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      openBlock === block
                        ? setOpenBlock(null)
                        : setOpenBlock(block)
                    }
                  >
                    <IoIosArrowDown
                      className={`${
                        openBlock === block ? 'rotate-180 transform' : ''
                      } mx-2 h-5 w-5 text-gray-900 dark:text-gray-300`}
                    />
                  </button>
                </div>
                <Transition
                  show={openBlock === block}
                  enter='transition duration-300 ease-in-out transform'
                  enterFrom='opacity-0 -translate-y-2'
                  enterTo='opacity-100 translate-y-0'
                  leave='transition duration-300 ease-in-out transform'
                  leaveFrom='opacity-100 translate-y-0'
                  leaveTo='opacity-0 -translate-y-2'
                >
                  <div className='flex flex-col'>
                    {block.timeblocks.length > 0 ? (
                      block.timeblocks?.map((timeblock: TimeBlock, i) => (
                        <div
                          key={i}
                          className='flex flex-row justify-between px-3 py-2 font-medium text-gray-600 dark:text-neutral-300'
                        >
                          <p>{dayToWeekday(timeblock.day)}</p>
                          <p>
                            {VSBtimeToDisplay(timeblock.t1)} -{' '}
                            {VSBtimeToDisplay(timeblock.t2)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className='flex flex-row justify-center px-3 py-2 dark:text-neutral-400'>
                        <p>No scheduled time block.</p>
                      </div>
                    )}
                  </div>
                </Transition>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  ) : null;
};
