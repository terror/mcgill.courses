import { VscBell, VscBellDot } from 'react-icons/vsc';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Notification } from '../model/Notification';

export const NotificationDropdown = ({
  notifications,
}: {
  notifications: Notification[];
}) => {
  return (
    <div className='text-right'>
      <Menu as='div' className='relative inline-block text-left'>
        <div>
          <Menu.Button className='m-2 inline-flex justify-center text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'>
            {notifications.length !== 0 ? (
              <VscBellDot
                className='hover:text-white-100 -mr-1 ml-2 h-5 w-5 stroke-[0.5] text-neutral-700 dark:text-white'
                aria-hidden='true'
              />
            ) : (
              <VscBell
                className='hover:text-white-100 -mr-1 ml-2 h-5 w-5 stroke-[0.5] text-neutral-700 dark:text-white'
                aria-hidden='true'
              />
            )}
          </Menu.Button>
        </div>
        {notifications.length !== 0 && (
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='z-100 absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
              <div className='px-1 py-1 '>
                {notifications.map((notification, i) => (
                  <Menu.Item key={i}>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-500 text-white' : 'text-gray-900'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        {notification.courseId}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        )}
      </Menu>
    </div>
  );
};
