import { Field } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

import { Course } from '../model/Course';
import { Autocomplete } from './Autocomplete';

export const ReviewSchema = Yup.object().shape({
  content: Yup.string().required('Required'),
  instructor: Yup.string().required('Required'),
  rating: Yup.number().min(0).max(5).required('Required'),
});

type ReviewFormInitialValues = {
  content: string;
  instructor: string;
  rating: number;
};

type ReviewFormProps = {
  course: Course;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  values: ReviewFormInitialValues;
};

export const ReviewForm = ({
  course,
  setFieldValue,
  values,
}: ReviewFormProps) => {
  const [query, setQuery] = useState('');

  const instructorNames = Array.from(
    new Set(course.instructors.map((instructor) => instructor.name))
  );

  const filteredInstructors =
    query === ''
      ? instructorNames
      : instructorNames.filter((instructor) => {
          return instructor.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <>
      <label htmlFor='instructor' className='mb-2'>
        Instructor
      </label>
      <Autocomplete
        arr={filteredInstructors}
        setValue={(instructor) => setFieldValue('instructor', instructor)}
        value={values.instructor}
        setQuery={setQuery}
      />
      <div className='flex flex-col'>
        <Field
          component='textarea'
          rows='8'
          id='content'
          name='content'
          placeholder='Write your thoughts on this course...'
          className='resize-none bg-gray-50 mt-6 p-3 rounded-md outline-none'
        />
        <label htmlFor='rating' className='mt-4 mb-2'>
          Rating
        </label>
        <Field
          type='number'
          id='rating'
          name='rating'
          className='p-2 rounded-md w-fit mb-4 bg-gray-50'
        />
        <button
          type='submit'
          className='bg-red-400 px-3 py-2 w-fit text-white rounded-md mt-4 hover:bg-red-500 transition duration-300'
        >
          Submit
        </button>
      </div>
    </>
  );
};
