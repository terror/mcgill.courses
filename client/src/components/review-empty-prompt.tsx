import { FileText } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type ReviewEmptyPromptProps = {
  className?: string;
  children: React.ReactNode;
};

export const ReviewEmptyPrompt = ({
  className,
  children,
}: ReviewEmptyPromptProps) => {
  return (
    <div
      className={twMerge('flex justify-center pb-56 text-gray-600', className)}
    >
      <div className='py-1' />
      <div className='mx-4 flex items-center gap-x-2 text-center text-sm sm:text-base'>
        <FileText className='stroke-gray-400 stroke-[1px]' size={40} />
        <div>{children}</div>
      </div>
    </div>
  );
};
