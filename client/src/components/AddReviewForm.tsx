import { Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';
import { Autocomplete } from './Autocomplete';

const ReviewSchema = Yup.object().shape({
  content: Yup.string().required('Required'),
  instructor: Yup.string().required('Required'),
  rating: Yup.number().min(0).max(5).required('Required'),
});

type ReviewFormProps = {
  course: Course;
};

export const AddReviewForm = ({ course }: ReviewFormProps) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    <div className='mx-2 w-6/12 bg-white rounded-lg p-6'>
      <h1 className='text-xl font-bold mb-8'>{`Reviewing ${course._id} - ${course.title}`}</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={ReviewSchema}
        onSubmit={async (values, actions) => {
          await fetchClient.post(
            `/reviews`,
            {
              course_id: course._id,
              ...values,
            },
            { headers: { 'Content-Type': 'application/json' } }
          );
          actions.setSubmitting(false);
          navigate(`/course/${params.id}`);
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
          </Form>
        )}
      </Formik>
    </div>
  );
};
