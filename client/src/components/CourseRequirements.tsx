import { Requirements } from '../model/Requirements';
import { Link } from 'react-router-dom';

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
      <h2 className='mb-2 mt-1 font-semibold leading-none text-gray-700 dark:text-gray-200'>
        {title}
      </h2>
      {reqs.map((req) => (
        <Link
          to={`/course/${req.replace(' ', '')}`}
          className='block text-gray-800 underline transition duration-100 hover:text-gray-600 dark:text-gray-200 hover:dark:text-gray-400'
        >
          {req}
        </Link>
      ))}
    </div>
  );
};

export const CourseRequirements = ({ requirements }: RequirementsProps) => {
  const hasRequirements =
    requirements.prereqs.length > 0 ||
    requirements.coreqs.length > 0 ||
    requirements.restrictions;

  return hasRequirements ? (
    <div className='w-screen rounded-md bg-slate-50 p-6 dark:bg-neutral-800 md:mx-4 md:ml-auto md:mr-10 md:mt-10 md:w-1/3'>
      <div className='flex-col space-y-3'>
        <div className='m-4 space-y-7'>
          {requirements.prereqs.length > 0 ? (
            <ReqsBlock title='Prerequisites' reqs={requirements.prereqs} />
          ) : null}
          {requirements.coreqs.length > 0 ? (
            <ReqsBlock title='Corequisites' reqs={requirements.coreqs} />
          ) : null}
          {requirements.restrictions !== null ? (
            <div>
              <h2 className='mb-2 mt-1 font-semibold leading-none text-gray-700 dark:text-gray-200'>
                Restrictions
              </h2>
              <p className='text-gray-500 dark:text-gray-400'>
                {requirements.restrictions}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;
};
