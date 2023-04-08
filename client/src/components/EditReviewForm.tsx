import { Form, Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/course';
import { Review } from '../model/review';
import { ReviewForm, ReviewSchema } from './ReviewForm';

type EditReviewFormProps = {
  course: Course;
  review: Review;
};

export const EditReviewForm = ({ course, review }: EditReviewFormProps) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const initialValues = {
    content: review.content,
    instructor: review.instructor,
    rating: review.rating,
  };

  return (
    <div className='mx-2 w-6/12 bg-white rounded-lg p-6'>
      <h1 className='text-xl font-bold mb-8'>{`Editing review of ${course._id} - ${course.title}`}</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={ReviewSchema}
        onSubmit={async (values, actions) => {
          await fetchClient.put(
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
