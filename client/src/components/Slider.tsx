import { ChangeEvent } from 'react';

type SliderProps = {
  min: number;
  max: number;
  value: number;
  step: number;
  onSliderChange: (value: number) => void;
};

export const Slider = ({
  min,
  max,
  value,
  step,
  onSliderChange,
}: SliderProps) => {
  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSliderChange(parseInt(event.target.value, 10));
  };

  return (
    <div className='flex w-full items-center justify-center'>
      <span className='mt-1'>≥</span>
      <label
        htmlFor='slider'
        className='ml-1 mr-2 mt-2 text-sm font-medium text-white'
      >
        {value}
      </label>
      <div className='relative mt-1 w-full bg-neutral-800'>
        <input
          type='range'
          id='slider'
          name='slider'
          className='h-2 w-full border-none bg-neutral-800'
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
        />
      </div>
    </div>
  );
};
