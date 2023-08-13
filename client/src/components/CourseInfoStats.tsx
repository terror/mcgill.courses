import { IconType } from 'react-icons';
import { LuFlame } from 'react-icons/lu';
import { round2Decimals } from '../lib/utils';
import { BirdIcon } from './BirdIcon';

type CourseInfoStatsProps = {
  rating: number;
  difficulty: number;
};

type FillBarProps = {
  width: number;
  percentage: number;
  text?: string;
};

const FillBar = ({ width, percentage, text }: FillBarProps) => {
  return (
    <div className='relative h-4 rounded-md bg-gray-300' style={{ width }}>
      <div
        className='h-4 rounded-md bg-red-500'
        style={{ width: (percentage / 100) * width }}
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
};

const Stat = ({ title, value, icon: Icon }: StatProps) => {
  return (
    <div>
      <div className='flex items-center gap-x-1'>
        <Icon className='-mt-0.5 stroke-red-600' size={18} />
        <div className='mb-0.5 text-xs font-medium uppercase tracking-wider text-gray-600'>
          {title}
        </div>
      </div>
      <div className='py-0.5' />
      <div className='flex items-center gap-x-2'>
        <FillBar width={144} percentage={value * 20} text={`${value}/5`} />
      </div>
    </div>
  );
};

export const CourseInfoStats = ({
  rating,
  difficulty,
}: CourseInfoStatsProps) => {
  if (isNaN(rating) || isNaN(difficulty)) return null;

  return (
    <div className='flex gap-x-4'>
      <div className='flex gap-x-1'>
        <Stat title='Rating' value={round2Decimals(rating)} icon={BirdIcon} />
      </div>
      <div className='py-1.5' />
      <div className='flex gap-x-1'>
        <Stat
          title='Difficulty'
          value={round2Decimals(difficulty)}
          icon={LuFlame}
        />
      </div>
    </div>
  );
};
