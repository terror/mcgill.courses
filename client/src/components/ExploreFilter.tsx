import { Combobox, Transition } from '@headlessui/react';
import { useState } from 'react';
import { BsSun } from 'react-icons/bs';
import { FaLeaf, FaRegSnowflake } from 'react-icons/fa';
import { GoX } from 'react-icons/go';

import courseCodes from '../assets/courseCodes.json';
import { classNames } from '../lib/utils';
import { ResetButton } from './ResetButton';

const termsOptions = ['Fall', 'Winter', 'Summer'];
const levelsOptions = ['1XX', '2XX', '3XX', '4XX', '5XX', '6XX', '7XX'];
const codesOptions = courseCodes;

type InputBoxProp = {
  selected: string[];
  setSelected: (selected: string[]) => void;
  options: string[];
};

type ExploreFilterProp = {
  selectedSubjects: string[];
  setSelectedSubjects: (selected: string[]) => void;
  selectedLevels: string[];
  setSelectedLevels: (selected: string[]) => void;
  selectedTerms: string[];
  setSelectedTerms: (selected: string[]) => void;
  variant: 'mobile' | 'desktop';
};

type FilterButtonProp = {
  icon?: JSX.Element;
  isSelected: boolean;
  name: string;
  selections: string[];
  setSelections: (selected: string[]) => void;
};

const FilterButton = ({
  icon,
  isSelected,
  name,
  selections,
  setSelections,
}: FilterButtonProp) => {
  const [selected, setSelected] = useState(isSelected);

  if (isSelected !== selected) setSelected(isSelected);

  const selectedColor = 'bg-red-600 text-gray-100';

  const unselectedColor =
    'bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-gray-100';

  return (
    <button
      className={`mx-2 ml-0 rounded-full px-4 py-2 font-semibold tracking-wider transition duration-150 ease-in-out
    ${selected ? selectedColor : unselectedColor}`}
      onClick={() => {
        setSelected(!selected);
        if (selected) {
          setSelections(selections.filter((selection) => selection !== name));
        } else {
          setSelections(selections.concat(name));
        }
      }}
    >
      <div className='flex items-center gap-x-2'>
        {icon && icon}
        {name}
      </div>
    </button>
  );
};

const CourseCodeBox = ({
  selectedOption,
  selectedOptions,
  setSelectedOptions,
}: {
  selectedOption: string;
  selectedOptions: string[];
  setSelectedOptions: (selected: string[]) => void;
}) => {
  return (
    <div className='mx-1 mt-4 flex h-8 w-28 items-center justify-end rounded-full bg-gray-100 dark:bg-neutral-700'>
      <p className='mx-auto my-auto pl-3 text-xl font-medium tracking-wider text-black dark:text-gray-100'>
        {selectedOption}
      </p>
      <button
        className='my-auto ml-auto p-1 pr-2 text-black'
        onClick={() =>
          setSelectedOptions(
            selectedOptions.filter(
              (option) => option !== selectedOption && option !== ''
            )
          )
        }
      >
        <GoX className='ml-0 h-5 w-5 duration-300 hover:text-red-600 dark:text-gray-100 dark:hover:text-red-700' />
      </button>
    </div>
  );
};

const InputBox = ({ selected, setSelected, options }: InputBoxProp) => {
  const [query, setQuery] = useState('');

  const filteredData =
    query === ''
      ? options
      : options.filter((data) => {
          return data.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div className='flex flex-col'>
      <div className='rounded-full border dark:border-neutral-700'>
        <Combobox
          value={selected}
          onChange={(val) => setSelected(val)}
          multiple
        >
          {' '}
          <div className='relative z-10 w-full cursor-default overflow-hidden rounded-full bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 dark:border-neutral-900 dark:bg-black sm:text-sm'>
            <Combobox.Input
              className='w-full border-none bg-neutral-50 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:outline-none dark:bg-neutral-800 dark:text-gray-200'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && filteredData.length > 0) {
                  setQuery('');
                }
              }}
              autoComplete='off'
            />
          </div>
          <Transition
            enter='transition ease-in-out duration-100 transform'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='transition ease-in-out duration-75 transform'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <div className='absolute z-50 w-full bg-white'>
              {query !== '' && (
                <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 sm:text-sm'>
                  {filteredData.length > 0 ? (
                    filteredData.map((data) => (
                      <Combobox.Option key={data} value={data}>
                        {({ active }) => (
                          <div
                            className={`${
                              active
                                ? 'bg-red-600 text-gray-100'
                                : 'text-gray-700 dark:text-gray-100'
                            } p-2 text-lg`}
                            onClick={() => {
                              setQuery('');
                            }}
                          >
                            {data}
                          </div>
                        )}
                      </Combobox.Option>
                    ))
                  ) : (
                    <p className='p-2 text-lg text-gray-800 dark:text-gray-100'>
                      No results found.
                    </p>
                  )}
                </Combobox.Options>
              )}
            </div>
          </Transition>
        </Combobox>
      </div>
    </div>
  );
};

const SelectedCourseCodes = ({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (selected: string[]) => void;
}) => {
  return selected.length > 0 ? (
    <div className='flex flex-wrap'>
      {selected.map((item, i) => (
        <CourseCodeBox
          key={i}
          selectedOption={item}
          selectedOptions={selected}
          setSelectedOptions={(value) => setSelected(value)}
        />
      ))}
    </div>
  ) : null;
};

export const ExploreFilter = ({
  selectedSubjects,
  setSelectedSubjects,
  selectedLevels,
  setSelectedLevels,
  selectedTerms,
  setSelectedTerms,
  variant,
}: ExploreFilterProp) => {
  const termToIcon = (term: 'Fall' | 'Winter' | 'Summer') => {
    switch (term) {
      case 'Fall':
        return <FaLeaf color='brown' />;
      case 'Winter':
        return <FaRegSnowflake color='skyblue' />;
      case 'Summer':
        return <BsSun color='orange' />;
    }
  };

  return (
    <div
      className={classNames(
        variant === 'mobile' ? 'mx-auto w-full' : 'ml-2 w-[90%]',
        'm-2 flex h-fit flex-col flex-wrap rounded-lg bg-slate-50 dark:bg-neutral-800 dark:text-gray-200'
      )}
    >
      <div className='flex flex-row'>
        <h1 className='m-10 mb-2 text-2xl font-semibold'>Filter</h1>
        <ResetButton
          className='ml-auto mr-10 mt-10'
          onClear={() => {
            setSelectedSubjects([]);
            setSelectedLevels([]);
            setSelectedTerms([]);
          }}
        />
      </div>
      <div className='m-10 my-5'>
        <div className='space-y-3'>
          <h1 className='text-xl font-semibold'>Course Code</h1>
          <InputBox
            selected={selectedSubjects}
            setSelected={(value) => setSelectedSubjects(value)}
            options={codesOptions}
          />
        </div>
        <SelectedCourseCodes
          selected={selectedSubjects}
          setSelected={setSelectedSubjects}
        />
        <div className='space-y-2'>
          <h1 className='mt-3 text-xl font-semibold'>Level</h1>
          {levelsOptions.map((level, i) => (
            <FilterButton
              key={i}
              name={level}
              isSelected={selectedLevels.includes(level)}
              selections={selectedLevels}
              setSelections={setSelectedLevels}
            />
          ))}
        </div>
        <div className='mb-8 space-y-2'>
          <h1 className='mt-3 text-xl font-semibold'>Term</h1>
          {termsOptions.map((term, i) => (
            <FilterButton
              icon={termToIcon(term as 'Fall' | 'Winter' | 'Summer')}
              key={i}
              name={term}
              isSelected={selectedTerms.includes(term)}
              selections={selectedTerms}
              setSelections={setSelectedTerms}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
