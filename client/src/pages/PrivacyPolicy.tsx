import { Layout } from '../components/Layout';
import { Paragraph } from '../components/Paragraph';

export const PrivacyPolicy = () => {
  const h2 = 'text-2xl font-bold text-neutral-700 dark:text-gray-300';
  const h1 = 'text-4xl font-bold text-neutral-700 dark:text-gray-300';

  return (
    <Layout>
      <div className='m-auto my-10 flex max-w-[800px] flex-col gap-9 px-2'>
        <h1 className={h1}>Privacy Policy</h1>
        <Paragraph>
          mcgill.courses is an Open-Sourced app. This service is provided at no
          cost and is intended for use as is. This page is used to inform
          visitors regarding our policies with the collection, use, and
          disclosure of Personal Information if anyone decided to use our
          Service. If you choose to use our Service, then you agree to the
          collection and use of information in relation to this policy. We do
          not store any personal information collected. We will not use or share
          your information with anyone except as described in this Privacy
          Policy. The terms used in this Privacy Policy have the same meanings
          as in our Terms and Conditions, which are accessible at mcgill.courses
          unless otherwise defined in this Privacy Policy.
        </Paragraph>

        <h2 className={h2}>Cookies</h2>

        <Paragraph>
          Cookies are files with a small amount of data that are commonly used
          as anonymous unique identifiers. These are sent to your browser from
          the websites that you visit and are stored on your device's internal
          memory. mcgill.courses uses Microsoft OAuth for user identification
          purposes. When you log in to our Service using your Microsoft account,
          a cookie is stored on your device's internal memory. This cookie
          allows us to maintain your login session and cache the fact that you
          are logged in for a certain period of time. Please note that we do not
          store any personal data through these cookies. The cookie solely
          serves the purpose of facilitating a seamless login experience and
          maintaining your session on our Service. We do not have access to or
          retain any personally identifiable information from Microsoft OAuth.
          You have the option to disable or delete these cookies through your
          browser settings, but doing so may impact the functionality and
          usability of our Service.
        </Paragraph>

        <h2 className={h2}>Security</h2>

        <Paragraph>
          We value your trust in providing us your Personal Information, thus we
          are striving to use commercially acceptable means of protecting it.
          But remember that no method of transmission over the internet, or
          method of electronic storage is 100 % secure and reliable, and we
          cannot guarantee its absolute security.
        </Paragraph>

        <h2 className={h2}>Changes to This Privacy Policy</h2>

        <Paragraph>
          We may update our Privacy Policy from time to time. Thus, you are
          advised to review this page periodically for any changes. We will
          notify you of any changes by posting the new Privacy Policy on this
          page. This policy is effective as of 2023-12-17.
        </Paragraph>

        <h2 className={h2}>Contact Us</h2>

        <Paragraph>
          If you have any questions or suggestions about our Privacy Policy, do
          not hesitate to contact us at admin@mcgill.courses.
        </Paragraph>
      </div>
    </Layout>
  );
};
