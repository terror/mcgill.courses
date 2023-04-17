import { Form, Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/Course';
import { ReviewForm, ReviewSchema } from './ReviewForm';

type ReviewFormProps = {
  course: Course;
};

export const AddReviewForm = ({ course }: ReviewFormProps) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initialValues = {
    content: '',
    instructor: '',
    rating: 0,
  };

  return (
    <div className='mx-2 w-6/12 rounded-lg bg-white p-6'>
      <h1 className='mb-8 text-xl font-bold'>{`Reviewing ${course._id} - ${course.title}`}</h1>
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
        {({ values, setFieldValue }) => (
          <Form>
            <ReviewForm
              course={course}
              values={values}
              setFieldValue={setFieldValue}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
};
