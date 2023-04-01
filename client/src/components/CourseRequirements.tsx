import { Requirements } from '../model/requirements';

type RequirementsProps = {
  requirements: Requirements;
};
export const CourseRequirements = ({ requirements }: RequirementsProps) => {
  return (
    <div className='w-screen  mx-4 p-6 bg-slate-50 rounded-md md:w-1/3 md:mt-10 md:ml-auto md:mr-10'>
      <div className='flex-col space-y-3'>
        <div className='space-y-7'>
          {requirements.prereqs.length > 0 ? (
            <div>
              <h2 className='leading-none mt-1 font-semibold text-gray-700'>
                Prerequisites
              </h2>
              {requirements.prereqs.map((prereq) => (
                <p className='text-gray-500'>{prereq}</p>
              ))}
            </div>
          ): null}
          {requirements.coreqs.length > 0 ? (
            <div>
              <h2 className='leading-none mt-1 font-semibold text-gray-700'>
                Corequisites
              </h2>
              {requirements.coreqs.map((coreq) => (
                <p className='text-gray-500'>{coreq}</p>
              ))}
            </div>
          ): null}
          {requirements.restrictions.length > 0 ? (
            <div>
              <h2 className='leading-none mt-1 font-semibold text-gray-700'>
                Restrictions
              </h2>
              {requirements.restrictions.map((restriction) => (
                <p className='text-gray-500'>{restriction}</p>
              ))}
            </div>
          ): null}
          {requirements.otherInformation.length > 0 ? (
            <div>
              <h2 className='leading-none mt-1 font-semibold text-gray-700'>
                Other Information
              </h2>
              {requirements.otherInformation.map((info) => (
                <p className='text-gray-500'>{info}</p>
              ))}
            </div>
          ): null}
        </div>
      </div>
    </div>
  );
};
