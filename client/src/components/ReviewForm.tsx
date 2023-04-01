import { Combobox } from '@headlessui/react';
import { Field, Form, Formik, useField, useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';

import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';
import { Instructor } from '../model/instructor';
import { Autocomplete } from './Autocomplete';

const ReviewSchema = Yup.object().shape({
  content: Yup.string().required('Required'),
  instructor: Yup.string().required('Required'),
  rating: Yup.number().min(0).max(5).required('Required'),
});

type ReviewFormProps = {
  course: Course;
};

export const ReviewForm = ({ course }: ReviewFormProps) => {
  const params = useParams<{ id: string }>();
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

  const initialValues = {
    content: '',
    instructor: '',
    rating: 0,
  };

  return (
    <div className='mx-2 w-2/6 bg-white rounded-lg p-6'>
      <h1 className='text-xl font-bold mb-2'>{`${course._id} - ${course.title}`}</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={ReviewSchema}
        onSubmit={async (values, actions) => {
          console.log(values);
          actions.setSubmitting(false);
        }}
      >
        {({ values, errors, touched, handleChange, setFieldValue }) => (
          <Form>
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
              <label htmlFor='rating' className='mt-4 mb-2'>
                Rating
              </label>
              <Field
                type='number'
                id='rating'
                name='rating'
                className='p-2 rounded-md w-fit bg-gray-50'
              />
              <Field
                component='textarea'
                rows='8'
                id='content'
                name='content'
                placeholder='Write your thoughts on this course...'
                className='resize-none bg-gray-50 mt-12 p-3 rounded-md outline-none'
              />
              <button
                type='submit'
                className='bg-red-400 px-3 py-2 w-fit text-white rounded-md mt-4 hover:bg-red-500 transition duration-300'
              >
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
