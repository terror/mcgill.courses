import { useEffect, useState } from 'react';
import { classNames } from '../lib/utils';
import { TimeBlock, Block, Schedule } from '../model/Schedule';
import { dedupe, sortTerms, sortBlocks } from '../lib/utils';
import { IoIosArrowDown } from 'react-icons/io';
import { Transition } from '@headlessui/react';

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

export const SchedulesDisplay = ({ schedules }: { schedules: Schedule[] }) => {
  const offeredTerms = sortTerms(
    dedupe(schedules.map((schedule) => schedule.term))
  );

  const [currentlyDisplayingTerm, setCurrentlyDisplayingTerm] =
    useState<string>(offeredTerms[0]);
  const [currentlyDisplayingSchedules, setCurrentlyDisplayingSchedules] =
    useState<Schedule[]>(
      schedules.filter((schedule) => schedule.term === currentlyDisplayingTerm)
    );
  const [openBlock, setOpenBlock] = useState<Block | null>(null);

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
    <div className='flex flex-col'>
      <div className='mx-8 mt-4 flex '>
        {offeredTerms.map((term, i) => (
          <button
            className={classNames(
              `flex-1 py-2 text-center transition duration-300 hover:cursor-pointer dark:text-gray-200`,
              term === currentlyDisplayingTerm
                ? 'dark:bg-neutral-700'
                : 'dark:bg-neutral-800 dark:hover:bg-neutral-700',
              i === 0 ? 'rounded-tl-lg' : '',
              i === offeredTerms.length - 1 ? 'rounded-tr-lg' : ''
            )}
            onClick={() => handleClick(term)}
          >
            {term}
          </button>
        ))}
      </div>
      <div className='mx-8 flex flex-col rounded-b-lg dark:bg-neutral-700 dark:text-gray-200'>
        {currentlyDisplayingSchedules.map((schedule: Schedule) => (
          <div>
            {sortBlocks(schedule.blocks)?.map((block: Block) => (
              <div className='flex flex-col'>
                <div
                  className={classNames(
                    'flex flex-row justify-between border-t border-neutral-600 p-2 px-3'
                  )}
                >
                  <div>
                    <span className='font-semibold'>{block.display}</span>{' '}
                    <span className='ml-2 font-semibold'>Campus: </span>
                    {block.campus}{' '}
                    <span className='ml-2 font-semibold'>Classroom(s): </span>
                    {block.location.replace(';', ',')}{' '}
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
                    {block.timeblocks?.map((timeblock: TimeBlock) => (
                      <div className='flex flex-row justify-between px-3 py-2 font-medium'>
                        <p>{dayToWeekday(timeblock.day)}</p>
                        <p>
                          {VSBtimeToDisplay(timeblock.t1)} -{' '}
                          {VSBtimeToDisplay(timeblock.t2)}
                        </p>
                      </div>
                    ))}
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
