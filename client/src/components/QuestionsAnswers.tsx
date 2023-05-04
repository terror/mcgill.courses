import { Disclosure } from '@headlessui/react';
import { IoIosArrowDown } from 'react-icons/io';

type QuestionsAnswersProp = {
  input: {
    title: string;
    content: JSX.Element | string;
  }[];
};

export const QuestionsAnswers = ({ input }: QuestionsAnswersProp) => {
  return (
    <div className='max-w-l mx-10 px-4 sm:mx-20 md:mx-40 lg:mx-60 xl:mx-80'>
      <div className='flex min-w-full max-w-md flex-col items-center justify-center space-y-3 bg-white p-2 dark:bg-neutral-900'>
        {input.map((item: { title: string; content: JSX.Element | string }) => (
          <Disclosure as='div' key={item.title} className='w-full'>
            {({ open }) => (
              <>
                <Disclosure.Button className='mx-auto flex w-full justify-between rounded-lg bg-red-100 px-4 py-2 text-left text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none  focus-visible:ring-opacity-75'>
                  <span>{item.title}</span>
                  <IoIosArrowDown
                    className={`${
                      open ? 'rotate-180 transform' : ''
                    } h-5 w-5 text-red-900`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className='px-4 pt-4 pb-2 text-sm text-gray-700 dark:text-gray-200'>
                  {item.content}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
};
