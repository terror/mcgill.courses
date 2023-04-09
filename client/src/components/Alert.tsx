import { useEffect, useState } from 'react';
import {
  AiOutlineCheckCircle,
  AiOutlineClose,
  AiOutlineInfoCircle,
} from 'react-icons/ai';
import { IoWarningOutline } from 'react-icons/io5';
import { VscError } from 'react-icons/vsc';
import { Link } from 'react-router-dom';

type alertStatus = 'error' | 'success' | 'info' | 'warning';

interface AlertProp {
  status: alertStatus;
  message?: string;
}

const defaultMessages = {
  error: 'There was an error processing your request, please try again later.',
  success: 'Your request was successful.',
  info: 'This is an informational message.',
  warning: 'This is a warning message.',
};

const statusColor = {
  error: 'bg-red-100 border-red-500 text-red-700',
  success: 'bg-green-100 border-green-500 text-green-700',
  info: 'bg-blue-100 border-blue-500 text-blue-700',
  warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
};

const statusIcon = {
  error: <VscError className='text-red-700' size={20} />,
  success: <AiOutlineCheckCircle className='text-green-700' size={20} />,
  info: <AiOutlineInfoCircle className='text-blue-700 ' size={20} />,
  warning: <IoWarningOutline className='text-yellow-700' size={20} />,
};

export const Alert = ({ status, message }: AlertProp) => {
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
      className={`
    ${
      show
        ? 'translate-y-0 md:translate-y-0 md:translate-y-0'
        : 'translate-y-full md:translate-y-[120%] md:translate-y-0'
    }
    ${statusColor[status]}
    p-4 fixed bottom-0 right-0 w-screen md:max-w-md md:w-full md:m-5 md:rounded-md shadow-md transition-all duration-300
  `}
      role='alert'
    >
      <div className='flex'>
        <div className='my-auto mr-2 ml-3 md:ml-1'>{statusIcon[status]}</div>
        {message ? (
          <p className='m-3 md:m-1 my-auto'>{message}</p>
        ) : (
          <p className='m-1'>
            {defaultMessages[status]}
            {status === 'error' ? (
              <p>
                If the problem persists, please{' '}
                <Link to='/about' className='underline'>
                  contact us
                </Link>
              </p>
            ) : null}
          </p>
        )}
        <AiOutlineClose
          className='mb-auto ml-auto'
          size={20}
          opacity={0.25}
          onClick={() => setShow(false)}
          cursor={'pointer'}
        ></AiOutlineClose>
      </div>
    </div>
  );
};
