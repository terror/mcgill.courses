import { Form, Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchClient } from '../lib/fetchClient';
import { Course } from '../model/Course';
import { ReviewForm, ReviewSchema } from './ReviewForm';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { classNames } from '../lib/utils';

type ReviewFormProps = {
  course: Course;
  open: boolean;
  onClose: () => void;
  handleSubmit: (res: Response) => void;
};

export const AddReviewForm = ({
  course,
  open,
  onClose,
  handleSubmit,
}: ReviewFormProps) => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [darkMode, _] = useDarkMode();

  const initialValues = {
    content: '',
    instructor: '',
    rating: 0,
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as='div'
        className={classNames('relative z-10', darkMode ? 'dark' : '')}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-200'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-150'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-neutral-800'>
                <Dialog.Title
                  as='h3'
                  className='mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-gray-200'
                >
                  {`Reviewing ${course._id} - ${course.title}`}
                </Dialog.Title>
                <Formik
                  initialValues={initialValues}
                  validationSchema={ReviewSchema}
                  onSubmit={async (values, actions) => {
                    const res = await fetchClient.post(
                      `/reviews`,
                      {
                        course_id: course._id,
                        ...values,
                      },
                      { headers: { 'Content-Type': 'application/json' } }
                    );
                    actions.setSubmitting(false);
                    onClose();
                    handleSubmit(res);
                  }}
                >
                  {({ values, setFieldValue, resetForm }) => (
                    <Form>
                      <ReviewForm
                        course={course}
                        values={values}
                        setFieldValue={setFieldValue}
                        resetForm={resetForm}
                      />
                    </Form>
                  )}
                </Formik>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
