import { RefreshCw } from 'react-feather';
import { classNames } from '../lib/utils';

export const ResetButton = ({
  className,
  onClear,
}: {
  className?: string;
  onClear: () => void;
}) => {
  return (
    <div
      className={classNames(
        'flex h-8 w-8 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100 dark:hover:bg-neutral-700',
        className ?? ''
      )}
    >
      <button onClick={onClear}>
        <RefreshCw className={'h-5 w-5 text-gray-700 dark:text-neutral-200'} />
      </button>
    </div>
  );
};
