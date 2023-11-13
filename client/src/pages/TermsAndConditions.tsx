import { Layout } from '../components/Layout';

export const TermsAndConditions = () => {
  const h2 = 'text-2xl text-neutral-700 dark:text-gray-300';
  const h1 = 'text-4xl font-bold text-neutral-700 dark:text-gray-300';
  const p =
    'text-md hyphens-auto break-words text-justify font-medium text-neutral-500 dark:text-gray-500';

  return (
    <Layout>
      <div className='space-y-5 px-10 py-7'>
        <h1 className={h1}>Terms and Conditions</h1>

        <p className={p}>
          By using mcgill.courses, these terms will automatically apply to you –
          you should make sure therefore that you read them carefully before
          using the website. As the website is open-sourced, You are allowed to
          copy or modify the app as per the liscence indicates.
        </p>

        <h2 className={h2}>General Usage</h2>

        <p className={p}>
          mcgill.courses is committed to ensuring that the website is as useful
          and efficient as possible. For that reason, we reserve the right to
          make changes to the website or to charge for its services, at any time
          and for any reason. We will never charge you for the website or its
          services without making it very clear to you exactly what you’re
          paying for.
        </p>

        <p className={p}>
          If you’re using the app outside of an area with Wi-Fi, you should
          remember that the terms of the agreement with your mobile network
          provider will still apply. As a result, you may be charged by your
          mobile provider for the cost of data for the duration of the
          connection while accessing the app, or other third-party charges. In
          using the app, you’re accepting responsibility for any such charges,
          including roaming data charges if you use the app outside of your home
          territory (i.e. region or country) without turning off data roaming.
          If you are not the bill payer for the device on which you’re using the
          app, please be aware that we assume that you have received permission
          from the bill payer for using the app.
        </p>

        <p className={p}>
          Along the same lines, mcgill.courses cannot always take responsibility
          for the way you use the website i.e. You need to make sure that your
          device stays charged – if it runs out of battery and you can’t turn it
          on to avail the Service, mcgill.courses cannot accept responsibility.
        </p>

        <p className={p}>
          With respect to mcgill.courses’s responsibility for your use of the
          app, when you’re using the app, it’s important to bear in mind that
          although we endeavor to ensure that it is updated and correct at all
          times, we do rely on third parties to provide information to us so
          that we can make it available to you. mcgill.courses accepts no
          liability for any loss, direct or indirect, you experience as a result
          of relying wholly on this functionality of the app.
        </p>

        <p className={p}>
          At some point, we may wish to update the app. The app is currently
          available on – the requirements for the system(and for any additional
          systems we decide to extend the availability of the app to) may
          change, and you’ll need to download the updates if you want to keep
          using the app. mcgill.courses does not promise that it will always
          update the app so that it is relevant to you and/or works with the
          version that you have installed on your device. However, you promise
          to always accept updates to the application when offered to you, We
          may also wish to stop providing the app, and may terminate use of it
          at any time without giving notice of termination to you. Unless we
          tell you otherwise, upon any termination, (a) the rights and licenses
          granted to you in these terms will end; (b) you must stop using the
          app, and (if needed) delete it from your device.
        </p>

        <h2 className={h2}>Community Guidelines</h2>

        <p className={p}>
          At mcgill.courses, we believe in fostering a positive and respectful
          community environment. We encourage users to follow these community
          guidelines when leaving reviews for courses offered at McGill
          University:
        </p>

        <p className={p}>
          - Truthfulness: All reviews must be truthful and accurately reflect
          your own experiences and opinions. Fabricated or misleading reviews
          are strictly prohibited.
        </p>

        <p className={p}>
          - Respect: Show respect towards instructors and fellow students. Avoid
          personal attacks, hate speech, or any form of harassment in your
          reviews or interactions.
        </p>

        <p className={p}>
          - Constructive Feedback: Provide constructive feedback that can help
          improve the course and the learning experience. Share your thoughts,
          opinions, and suggestions in a respectful manner.
        </p>

        <p className={p}>
          - Confidentiality: Do not disclose any confidential or private
          information about individuals or specific course content that may
          violate privacy or academic integrity.
        </p>

        <p className={p}>
          - Non-Discrimination: Refrain from making discriminatory remarks or
          engaging in any form of discrimination based on race, gender,
          religion, nationality, sexual orientation, or any other protected
          characteristic.
        </p>

        <p className={p}>
          Failure to comply with these community guidelines may result in the
          removal of reviews or temporary/permanent bans from our platform. We
          reserve the right to take appropriate action as deemed necessary to
          maintain a safe and inclusive community environment. By using
          mcgill.courses, you agree to abide by these community guidelines and
          understand the consequences for violating them.
        </p>

        <h2 className='text-2xl text-neutral-700 dark:text-gray-300'>
          Changes to This Terms and Conditions
        </h2>

        <p className={p}>
          We may update our Terms and Conditions from time to time. Thus, you
          are advised to review this page periodically for any changes. We will
          notify you of any changes by posting the new Terms and Conditions on
          this page. If you have any questions or suggestions about our Terms
          and Conditions, do not hesitate to contact us at admin@mcgill.courses.
        </p>
      </div>
    </Layout>
  );
};
