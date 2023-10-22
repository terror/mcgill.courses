import { ErrorMessage, Field, FormikState } from 'formik';
import { PersistFormikValues } from 'formik-persist-values';
import { LuFlame } from 'react-icons/lu';
import * as Yup from 'yup';

import type { Course } from '../model/Course';
import { BirdIcon } from './BirdIcon';
import { IconRatingInput } from './IconRatingInput';
import { MultiSelect } from './MultiSelect';

export const ReviewSchema = Yup.object().shape({
  content: Yup.string()
    .required('Review content is required')
    .max(3000, 'Must be less than 3000 characters'),
  instructors: Yup.array().min(1, 'At least 1 instructor is required'),
  rating: Yup.number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .required('Rating is required'),
  difficulty: Yup.number()
    .min(1, 'Difficulty must be between 1 and 5')
    .max(5, 'Difficulty must be between 1 and 5')
    .required('Difficulty is required'),
});

export type ReviewFormInitialValues = {
  content: string;
  instructors: string[];
  rating: number;
  difficulty: number;
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
  const instructorNames = Array.from(
    new Set(course.instructors.map((instructor) => instructor.name))
  );

  instructorNames.push('Other');

  return (
    <>
      <label htmlFor='instructors' className='dark:text-gray-200'>
        Instructor(s)
      </label>
      <MultiSelect
        className='mt-2'
        options={instructorNames}
        setValues={(instructors) => setFieldValue('instructors', instructors)}
        values={values.instructors}
      />
      <div className='italic text-red-400'>
        <ErrorMessage name='instructors' />
      </div>
      <div className='flex flex-col'>
        <label htmlFor='content' className='mb-2 mt-4 dark:text-gray-200'>
          Content
        </label>
        <Field
          component='textarea'
          rows='8'
          id='content'
          name='content'
          placeholder='Write your thoughts on this course...'
          className='resize-none rounded-md bg-gray-50 p-3 outline-none dark:bg-neutral-700 dark:text-gray-200 dark:caret-white'
        />
        <div className='italic text-red-400'>
          <ErrorMessage name='content' />
        </div>
        <label htmlFor='rating' className='mb-2 mt-4 dark:text-gray-200'>
          Rating
        </label>
        <IconRatingInput
          name='rating'
          rating={values.rating}
          icon={BirdIcon}
          setFieldValue={setFieldValue}
        />
        <div className='italic text-red-400'>
          <ErrorMessage name='rating' />
        </div>
        <label htmlFor='difficulty' className='my-2 mt-4 dark:text-gray-200'>
          Difficulty
        </label>
        <IconRatingInput
          name='difficulty'
          rating={values.difficulty}
          icon={LuFlame}
          setFieldValue={setFieldValue}
        />
        <div className='italic text-red-400'>
          <ErrorMessage name='difficulty' />
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
        <PersistFormikValues name={course._id} persistInvalid={true} />
      </div>
    </>
  );
};
