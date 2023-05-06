import { ErrorMessage, Field, FormikState } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';

import { Course } from '../model/Course';
import { Autocomplete } from './Autocomplete';
import { StarRatingInput } from './StarRatingInput';
import { PersistFormikValues } from 'formik-persist-values';

export const ReviewSchema = Yup.object().shape({
  content: Yup.string()
    .required('Review body is required')
    .max(3000, 'Must be less than 3000 characters'),
  instructor: Yup.string().required('Instructor is required'),
  rating: Yup.number()
    .min(1, 'Rating must be between 0 and 5')
    .max(5, 'Rating must be between 0 and 5')
    .required('Rating is required'),
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
  resetForm: (
    nextState?: Partial<FormikState<ReviewFormInitialValues>> | undefined
  ) => void;
};

export const ReviewForm = ({
  course,
  setFieldValue,
  values,
  resetForm,
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
      <label htmlFor='instructor' className='mb-2 dark:text-gray-200'>
        Instructor
      </label>
      <Autocomplete
        arr={filteredInstructors}
        setValue={(instructor) => setFieldValue('instructor', instructor)}
        value={values.instructor}
        setQuery={setQuery}
      />
      <div className='italic text-red-400'>
        <ErrorMessage name='instructor' />
      </div>
      <div className='flex flex-col'>
        <Field
          component='textarea'
          rows='8'
          id='content'
          name='content'
          placeholder='Write your thoughts on this course...'
          className='mt-6 resize-none rounded-md bg-gray-50 p-3 outline-none dark:bg-neutral-700 dark:text-gray-200 dark:caret-white'
        />
        <div className='italic text-red-400'>
          <ErrorMessage name='content' />
        </div>
        <label htmlFor='rating' className='mb-2 mt-4 dark:text-gray-200'>
          Rating
        </label>
        <StarRatingInput
          name='rating'
          rating={values.rating}
          setFieldValue={setFieldValue}
        />
        <div className='italic text-red-400'>
          <ErrorMessage name='rating' />
        </div>
        <div className='mt-4 flex justify-end space-x-4'>
          <div
            onClick={() => resetForm()}
            className='w-fit cursor-pointer rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600'
          >
            Discard
          </div>
          <button
            type='submit'
            className='ml-auto w-fit rounded-md bg-red-500 px-3 py-2 text-white transition duration-300 hover:bg-red-600'
          >
            Submit
          </button>
        </div>
        <PersistFormikValues name={course._id} />
      </div>
    </>
  );
};
