import { twMerge } from 'tailwind-merge';

export const Paragraph = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p
    className={twMerge(
      'md:text-lg md:leading-loose text-base leading-loose text-gray-700 dark:text-gray-200',
      className
    )}
  >
    {children}
  </p>
);
