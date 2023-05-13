import { Combobox, Transition } from '@headlessui/react';
import { ChevronDown } from 'react-feather';

type AutocompleteProps = {
  arr: string[];
  value: string;
  setValue: (value: string) => void;
  setQuery: (query: string) => void;
};

export const Autocomplete = ({
  arr,
  value,
  setValue,
  setQuery,
}: AutocompleteProps) => {
  return (
    <div className='w-72'>
      <Combobox
        value={value}
        onChange={(val) => {
          setValue(val);
        }}
      >
        <div className='relative w-full'>
          <div className='relative rounded-md bg-gray-50 p-2 dark:bg-neutral-700'>
            <Combobox.Input
              className='bg-gray-50 outline-none dark:bg-neutral-700 dark:text-gray-200 dark:caret-white'
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className='absolute inset-y-0 flex w-full items-center'>
              <ChevronDown
                className='ml-auto mr-4 h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </Combobox.Button>
          </div>
          <Transition
            enter='transition duration-100 ease-out'
            enterFrom='transform scale-95 opacity-0'
            enterTo='transform scale-100 opacity-100'
            leave='transition duration-75 ease-out'
            leaveFrom='transform scale-100 opacity-100'
            leaveTo='transform scale-95 opacity-0'
          >
            <Combobox.Options className='absolute h-80 w-full overflow-scroll rounded-md shadow-md'>
              {arr.map((val, i) => (
                <Combobox.Option
                  key={i}
                  value={val}
                  className={({ active }) => `p-2
                    ${
                      active
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-900 dark:bg-neutral-600 dark:text-gray-200'
                    }`}
                >
                  {val}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};
