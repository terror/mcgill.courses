import { useState } from 'react';
import { RefreshCw } from 'react-feather';
import { twMerge } from 'tailwind-merge';

import courseCodes from '../assets/courseCodes.json';
import { MultiSelect } from './MultiSelect';

const termsOptions = ['Fall', 'Winter', 'Summer'];
const levelsOptions = ['1XX', '2XX', '3XX', '4XX', '5XX', '6XX', '7XX'];

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
  name: string;
  isSelected: boolean;
  selections: string[];
  setSelections: (selected: string[]) => void;
};

const FilterButton = ({
  name,
  isSelected,
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
      className={twMerge(
        'mx-2 ml-0 rounded-full px-4 py-2 font-semibold tracking-wider transition duration-150 ease-in-out',
        selected ? selectedColor : unselectedColor
      )}
      onClick={() => {
        setSelected(!selected);
        if (selected) {
          setSelections(selections.filter((selection) => selection !== name));
        } else {
          setSelections(selections.concat(name));
        }
      }}
    >
      {name}
    </button>
  );
};

const ClearButton = ({
  setSelectedSubjects,
  setSelectedLevels,
  setSelectedTerms,
}: {
  setSelectedSubjects: (selected: string[]) => void;
  setSelectedLevels: (selected: string[]) => void;
  setSelectedTerms: (selected: string[]) => void;
}) => {
  return (
    <div className='ml-auto flex h-8 w-8 items-center justify-center rounded-full transition duration-200 hover:bg-gray-100 dark:hover:bg-neutral-700'>
      <button
        onClick={() => {
          setSelectedSubjects([]);
          setSelectedLevels([]);
          setSelectedTerms([]);
        }}
      >
        <RefreshCw className={'h-5 w-5 text-gray-700 dark:text-neutral-200'} />
      </button>
    </div>
  );
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
  return (
    <div
      className={twMerge(
        variant === 'mobile' ? 'w-full' : 'w-96',
        'flex h-fit flex-col flex-wrap rounded-lg bg-slate-50 px-10 py-8 dark:bg-neutral-800 dark:text-gray-200'
      )}
    >
      <div className='flex flex-row'>
        <h1 className='text-2xl font-semibold'>Filter</h1>
        <div className='py-1' />
        <ClearButton
          setSelectedSubjects={setSelectedSubjects}
          setSelectedLevels={setSelectedLevels}
          setSelectedTerms={setSelectedTerms}
        />
      </div>
      <div className='py-2.5' />
      <h1 className='text-xl font-semibold'>Course Code</h1>
      <div className='py-1.5' />
      {/* TODO: Clicking on an option with a query in the field is kinda broken*/}
      <MultiSelect
        options={courseCodes}
        values={selectedSubjects}
        setValues={setSelectedSubjects}
      />
      <div>
        <h1 className='mt-3 text-xl font-semibold'>Level</h1>
        <div className='py-1' />
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
      <div className='space-y-2'>
        <h1 className='mt-3 text-xl font-semibold'>Term</h1>
        {termsOptions.map((term, i) => (
          <FilterButton
            key={i}
            name={term}
            isSelected={selectedTerms.includes(term)}
            selections={selectedTerms}
            setSelections={setSelectedTerms}
          />
        ))}
      </div>
    </div>
  );
};
