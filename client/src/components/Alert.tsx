import { useEffect, useState } from 'react';
import { AiFillCheckCircle, AiFillInfoCircle } from 'react-icons/ai';
import { IoWarning } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

const defaultMessages = {
  error: 'There was an error processing your request, please try again later.',
  success: 'Your request was successful.',
  info: 'This is an informational message.',
  warning: 'This is a warning message.',
};

const statusColor = {
  error:
    'bg-gray-200 dark:bg-neutral-700 border-gray-500 dark:text-neutral-200 text-gray-500',
  success:
    'bg-gray-200 dark:bg-neutral-700 border-green-500 dark:text-neutral-200 text-gray-500',
  info: 'bg-gray-200 dark:bg-neutral-700 border-blue-500 dark:text-neutral-200 text-gray-500',
  warning:
    'bg-gray-200 dark:bg-neutral-700 border-yellow-500 dark:text-neutral-200 text-gray-500',
};

const statusIcon = {
  error: <IoWarning className='text-red-400 opacity-60' size={25} />,
  success: (
    <AiFillCheckCircle className='text-green-400 opacity-60' size={23} />
  ),
  info: <AiFillInfoCircle className='text-blue-300 opacity-70' size={23} />,
  warning: <IoWarning className='text-yellow-300 opacity-70' size={25} />,
};

export type AlertStatus = 'error' | 'success' | 'info' | 'warning';

type AlertProps = {
  status: AlertStatus;
  message?: string;
};

export const Alert = ({ status, message }: AlertProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={twMerge(
        'fixed bottom-0 right-0 z-50 w-screen cursor-pointer p-4 shadow-sm transition-all duration-300 md:m-5 md:w-full md:max-w-md md:rounded-md md:bg-opacity-50',
        show
          ? 'translate-y-0 md:translate-y-0'
          : 'translate-y-full md:translate-y-[150%]',
        statusColor[status]
      )}
      role='alert'
    >
      <div className='flex'>
        <div className='my-auto ml-3 mr-2 md:ml-1'>{statusIcon[status]}</div>
        {message ? (
          <p className='m-3 my-auto md:m-1'>{message}</p>
        ) : (
          <p className='m-1'>
            {defaultMessages[status]}
            {status === 'error' && (
              <p>
                If the problem persists, please{' '}
                <Link to='/about' className='underline'>
                  contact us
                </Link>
              </p>
            )}
          </p>
        )}
      </div>
    </div>
  );
};
