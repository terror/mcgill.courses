import { Combobox } from '@headlessui/react';
import { useState } from 'react';
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
        onChange={(instructor) => {
          setValue(instructor);
        }}
      >
        <div className='relative w-full'>
          <div className='relative bg-gray-50 rounded-md p-2'>
            <Combobox.Input
              className='outline-none bg-gray-50'
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>
              <ChevronDown
                className='h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className='absolute shadow-md w-full rounded-md'>
            {arr.map((val, i) => (
              <Combobox.Option
                key={i}
                value={val}
                className={({ active }) => `p-2
                    ${
                      active
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-900'
                    }`}
              >
                {val}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
};
