import { Requirements } from '../model/requirements';

type RequirementsProps = {
  requirements: Requirements;
};

type InfoBlockProps = {
  title: string;
  elements: string[];
};

export const InfoBlock = ({ title, elements }: InfoBlockProps) => {
  return (
    <div>
      <h2 className='leading-none mt-1 mb-2 font-semibold text-gray-700'>
        {title}
      </h2>
      {elements.map((element) => (
        <p className='text-gray-500'>{element}</p>
      ))}
    </div>
  );
};

export const CourseRequirements = ({ requirements }: RequirementsProps) => {
  return (
    <div className='w-screen  mx-4 p-6 bg-slate-50 rounded-md md:w-1/3 md:mt-10 md:ml-auto md:mr-10'>
      <div className='flex-col space-y-3'>
        <div className='space-y-7'>
          {requirements.prereqs.length > 0 ? (
            <InfoBlock title='Prerequisites' elements={requirements.prereqs} />
          ) : null}
          {requirements.coreqs.length > 0 ? (
            <InfoBlock title='Corequisites' elements={requirements.coreqs} />
          ) : null}
          {requirements.restrictions.length > 0 ? (
            <InfoBlock
              title='Restrictions'
              elements={requirements.restrictions}
            />
          ) : null}
          {requirements.otherInformation.length > 0 ? (
            <InfoBlock
              title='Other Information'
              elements={requirements.otherInformation}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
