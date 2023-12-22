import { LuFileText } from 'react-icons/lu';
import { twMerge } from 'tailwind-merge';

type ReviewEmptyPromptProps = {
  className?: string;
  variant?: 'course' | 'instructor';
};

export const ReviewEmptyPrompt = ({
  className,
  variant,
}: ReviewEmptyPromptProps) => {
  return (
    <div
      className={twMerge('text-gray-600 pb-56 flex justify-center', className)}
    >
      <div className='py-1' />
      <div className='mx-4 flex items-center gap-x-2 text-center text-sm sm:text-base'>
        <LuFileText className='stroke-gray-400 stroke-[1px]' size={40} />
        <div>
          No reviews have been left for this {variant} yet, be the first!
        </div>
      </div>
    </div>
  );
};
