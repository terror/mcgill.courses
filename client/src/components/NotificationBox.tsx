import React from 'react';
import { Link } from 'react-router-dom';

type status = 'Error' | 'Success' | 'Info' | 'Warning';

interface Notification {
  status: status;
  message?: string;
}

export const NotificationBox = ({ status, message }: Notification) => {
  const defaultMessages = {
    Error: (
      <p>
        There was an error processing your request, please try again later. If
        the error persists, please{' '}
        <span className='underline'>
          <Link to='/about'>contact us</Link>
        </span>
      </p>
    ),
    Success: <p>Your request was processed successfully.</p>,
    Info: <p>This is an informational message.</p>,
    Warning: <p>This is a warning message.</p>,
  };

  const statusColor = {
    Error: 'bg-red-100 border-red-500 text-red-700',
    Success: 'bg-green-100 border-green-500 text-green-700',
    Info: 'bg-blue-100 border-blue-500 text-blue-700',
    Warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  };

  return (
    <div
      className={
        statusColor[status] +
        ' p-4 fixed bottom-0 right-0 max-w-sm w-full mb-5 mr-5'
      }
      role='alert'
    >
      <p className='font-semibold'>{status}</p>
      {message ? <p>{message}</p> : <p>{defaultMessages[status]}</p>}
    </div>
  );
};
