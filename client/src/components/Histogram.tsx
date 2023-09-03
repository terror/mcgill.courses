import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type HistogramProps = {
  data: number[];
  max: number;
  width: number;
  height: number;
  gap?: number;
  className?: string;
};

export const Histogram = ({
  data,
  max,
  width,
  height,
  gap = 4,
  className,
}: HistogramProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const distribution = useMemo(
    () =>
      data.reduce((acc, curr) => {
        acc[curr - 1]++;
        return acc;
      }, Array(max).fill(0)),
    [data]
  );

  return (
    <div className={twMerge('relative w-fit', className)}>
      <div className='flex items-end' style={{ width, height }}>
        {distribution.map((count, index) => (
          <div key={index} className='flex flex-col items-center text-xs'>
            <div
              className={
                'ml-0.5 rounded-t-sm bg-red-500 transition-all duration-700 ease-in-out'
              }
              style={{
                width: width / distribution.length - gap,
                height: !loaded ? 0 : (count / data.length) * (height - 12),
                marginLeft: gap / 2,
                marginRight: gap / 2,
              }}
            />
            <div className='font-medium text-gray-500 dark:text-gray-400'>
              {index + 1}
            </div>
          </div>
        ))}
      </div>
      <div className='absolute bottom-4 h-[1px] w-full bg-gray-300 dark:bg-gray-600' />
    </div>
  );
};
