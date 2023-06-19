import { Link } from 'react-router-dom';

import { Requirements } from '../model/Requirements';

type RequirementsProps = {
  requirements: Requirements;
};

type ReqsBlockProps = {
  title: string;
  reqs: string[];
};

export const ReqsBlock = ({ title, reqs }: ReqsBlockProps) => {
  return (
    <div>
      <h2 className='mb-2 mt-1 text-xl font-bold leading-none text-gray-700 dark:text-gray-200'>
        {title}
      </h2>
      {reqs.length > 0 ? (
        reqs.map((req, i) => (
          <Link
            key={i}
            to={`/course/${req.replace(' ', '')}`}
            className='block text-gray-500 underline transition duration-100 hover:text-gray-600 dark:text-gray-400 hover:dark:text-gray-200'
          >
            {req}
          </Link>
        ))
      ) : (
        <p className='text-gray-500 dark:text-gray-400'>
          This course has no {title.toLowerCase()}.
        </p>
      )}
    </div>
  );
};

export const CourseRequirements = ({ requirements }: RequirementsProps) => {
  return (
    <div className='max-h-fit w-full rounded-md bg-slate-50 p-4 dark:bg-neutral-800'>
      <div className='flex-col space-y-3'>
        <div className='m-4 space-y-7'>
          <ReqsBlock title='Prerequisites' reqs={requirements.prereqs} />
          <ReqsBlock title='Corequisites' reqs={requirements.coreqs} />
          <div>
            <h2 className='mb-2 mt-1 text-xl font-bold leading-none text-gray-700 dark:text-gray-200'>
              Restrictions
            </h2>
            {requirements.restrictions !== null ? (
              <p className='text-gray-500 dark:text-gray-400'>
                {requirements.restrictions}
              </p>
            ) : (
              <p className='text-gray-500 dark:text-gray-400'>
                This course has no restrictions.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
