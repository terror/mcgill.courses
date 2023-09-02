import _ from 'lodash';
import { useEffect, useState } from 'react';
import { IconType } from 'react-icons';
import { LuFlame } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { round2Decimals } from '../lib/utils';
import { Review } from '../model/Review';
import { BirdIcon } from './BirdIcon';
import { Histogram } from './Histogram';

type CourseInfoStatsProps = {
  allReviews: Review[];
  className?: string;
  variant?: 'small' | 'large';
};

type FillBarProps = {
  width: number;
  percentage: number;
  text?: string;
  variant?: 'small' | 'large';
};

const FillBar = ({ width, percentage, text, variant }: FillBarProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      className={twMerge(
        'relative rounded-md bg-gray-300 dark:bg-gray-700',
        variant === 'large' ? 'h-5' : 'h-4'
      )}
      style={{ width }}
    >
      <div
        className={twMerge(
          'rounded-l-md bg-red-500 transition-all duration-1000 ease-in-out',
          variant === 'large' ? 'h-5' : 'h-4'
        )}
        style={{ width: !loaded ? 0 : (percentage / 100) * width }}
      />
      <div className='absolute inset-y-0 flex w-full justify-center text-sm font-bold leading-4 text-white'>
        {text}
      </div>
    </div>
  );
};

type StatProps = {
  title: string;
  value: number;
  icon: IconType;
  variant: 'small' | 'large';
};

const Stat = ({ title, value, icon: Icon, variant }: StatProps) => {
  return (
    <div>
      <div className='flex items-center gap-x-1'>
        <Icon className='-mt-0.5 stroke-red-600' size={18} />
        <div
          className={twMerge(
            'mb-0.5 text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400'
          )}
        >
          {title}
        </div>
      </div>
      <div className='py-0.5' />
      <div className='flex items-center gap-x-2'>
        <FillBar
          width={variant === 'large' ? 180 : 144}
          percentage={value * 20}
          text={`${value}/5`}
          variant={variant}
        />
      </div>
    </div>
  );
};

export const CourseInfoStats = ({
  allReviews,
  className,
  variant = 'small',
}: CourseInfoStatsProps) => {
  if (allReviews.length === 0) {
    return null;
  }

  const lg = useMediaQuery('(min-width: 1024px)');

  const ratings = allReviews.map((r) => r.rating);
  const averageRating = _.sum(ratings) / allReviews.length;
  const difficulties = allReviews.map((r) => r.difficulty);
  const averageDifficulty = _.sum(difficulties) / allReviews.length;

  return (
    <div
      className={twMerge(
        'flex gap-x-4 bg-slate-50 dark:bg-neutral-800',
        variant === 'large'
          ? 'flex-col gap-y-1 lg:flex-row lg:gap-x-2'
          : 'flex-row',
        className
      )}
    >
      <div className='md:rounded-xl md:p-2'>
        <Stat
          title='Rating'
          value={round2Decimals(averageRating)}
          icon={BirdIcon}
          variant={variant}
        />
        <div className='py-2' />
        <Histogram
          width={180}
          height={lg ? 132 : 80}
          data={ratings}
          max={5}
          gap={10}
          className='mx-auto hidden md:block'
        />
      </div>
      <div className='py-1.5' />
      <div className='md:rounded-xl md:p-2'>
        <Stat
          title='Difficulty'
          value={round2Decimals(averageDifficulty)}
          icon={LuFlame}
          variant={variant}
        />
        <div className='py-2' />
        <Histogram
          width={180}
          height={lg ? 132 : 80}
          data={difficulties}
          max={5}
          gap={10}
          className='mx-auto hidden md:block'
        />
      </div>
    </div>
  );
};
