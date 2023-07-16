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
  error: 'bg-red-200 border-red-500 text-neutral-200',
  success: 'bg-green-100 border-green-500 text-neutral-200',
  info: 'bg-blue-100 border-blue-500 text-neutral-200',
  warning: 'bg-yellow-100 border-yellow-500 text-neutral-200',
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
        'bottom-e fixed right-0 z-50 w-screen cursor-pointer bg-opacity-50 p-4 shadow-md transition-all duration-300 md:m-5 md:w-full md:max-w-md md:rounded-md',
        show
          ? 'translate-y-0 md:translate-y-0'
          : 'translate-y-full md:translate-y-[150%]',
        statusColor[status]
      )}
      role='alert'
    >
      <div className='flex '>
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
