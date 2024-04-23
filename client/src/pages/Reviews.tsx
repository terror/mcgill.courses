import { useEffect, useState } from 'react';

import { CourseReview } from '../components/CourseReview';
import { Layout } from '../components/Layout';
import { repo } from '../lib/repo';
import { Review } from '../model/Review';

export const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    repo.getReviews().then((data) => setReviews(data));
  }, []);

  return (
    <Layout>
      {reviews.map((review, i) => (
        <CourseReview
          review={review}
          canModify={false}
          handleDelete={() => undefined}
          openEditReview={() => undefined}
          key={i}
        />
      ))}
    </Layout>
  );
};
