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
    <div className={twMerge('w-full text-center text-gray-600', className)}>
      <LuFileText className='mx-auto stroke-gray-400 stroke-[1px]' size={40} />
      <div className='py-1' />
      <div>No reviews have been left for this {variant} yet, be the first!</div>
    </div>
  );
};
