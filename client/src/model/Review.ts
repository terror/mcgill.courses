type Timestamp = {
  $date: {
    $numberLong: string;
  };
};

export type Review = {
  content: string;
  courseId: string;
  instructor: string;
  rating: number; // 0-5
  timestamp: Timestamp;
  userId: string;
};
