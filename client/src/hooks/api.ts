import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '../lib/api';
import { InteractionKind } from '../lib/types';
import { spliceCourseCode } from '../lib/utils';

export const queryKeys = {
  courses: ['courses'] as const,
  course: (id: string) => ['courses', id] as const,
  courseWithReviews: (id: string) => ['courses', id, 'reviews'] as const,
  reviews: ['reviews'] as const,
  reviewsWithParams: (params: any) => ['reviews', params] as const,
  subscriptions: ['subscriptions'] as const,
  subscription: (courseId: string) => ['subscriptions', courseId] as const,
  notifications: ['notifications'] as const,
  interactions: (courseId: string, userId: string) =>
    ['interactions', courseId, userId] as const,
  courseInteractions: (courseId: string, referrer: string) =>
    ['course-interactions', courseId, referrer] as const,
  instructor: (name: string) => ['instructors', name] as const,
  search: (query: string) => ['search', query] as const,
  user: ['user'] as const,
};

export const useCourseWithReviews = (courseId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.courseWithReviews(courseId || ''),
    queryFn: () => api.getCourseWithReviews(courseId),
    enabled: !!courseId,
  });
};

export const useCourses = (
  limit: number,
  offset: number,
  withCourseCount?: boolean,
  filters?: any
) => {
  return useQuery({
    queryKey: [
      ...queryKeys.courses,
      { limit, offset, withCourseCount, filters },
    ],
    queryFn: () => api.getCourses(limit, offset, withCourseCount, filters),
    placeholderData: (previousData) => previousData,
  });
};

export const useInfiniteCourses = (limit: number, filters?: any) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.courses, 'infinite', { limit, filters }],
    queryFn: ({ pageParam = 0 }) =>
      api.getCourses(limit, pageParam, pageParam === 0, filters),
    getNextPageParam: (lastPage, pages) => {
      const nextOffset = pages.length * limit;
      return lastPage.courses.length === limit ? nextOffset : undefined;
    },
    initialPageParam: 0,
  });
};

export const useReviews = (params?: {
  courseId?: string;
  instructorName?: string;
  limit?: number;
  offset?: number;
  sorted?: boolean;
  userId?: string;
  withUserCount?: boolean;
}) => {
  return useQuery({
    queryKey: queryKeys.reviewsWithParams(params),
    queryFn: () => api.getReviews(params),
  });
};

export const useInfiniteReviews = (limit: number, sorted = true) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.reviews, 'infinite', { limit, sorted }],
    queryFn: ({ pageParam = 0 }) =>
      api.getReviews({
        limit,
        offset: pageParam,
        sorted,
        withUserCount: pageParam === 0,
      }),
    getNextPageParam: (lastPage, pages) => {
      const nextOffset = pages.length * limit;
      return lastPage.reviews.length === limit ? nextOffset : undefined;
    },
    initialPageParam: 0,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, values }: { courseId: string; values: any }) =>
      api.addReview(courseId, values),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseWithReviews(courseId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
      toast.success('Review added successfully!');
    },
    onError: () => {
      toast.error('Failed to add review. Please try again.');
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, values }: { courseId: string; values: any }) =>
      api.updateReview(courseId, values),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseWithReviews(courseId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
      toast.success('Review updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update review. Please try again.');
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => api.deleteReview(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseWithReviews(courseId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
      toast.success('Review deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete review. Please try again.');
    },
  });
};

export const useSubscriptions = () => {
  return useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: api.getSubscriptions,
  });
};

export const useSubscription = (courseId: string) => {
  return useQuery({
    queryKey: queryKeys.subscription(courseId),
    queryFn: () => api.getSubscription(courseId),
    meta: {
      onError: () => {
        toast.error(
          `Failed to check subscription for course ${spliceCourseCode(
            courseId,
            ' '
          )}`
        );
      },
    },
  });
};

export const useAddSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => api.addSubscription(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription(courseId),
      });
      toast.success(`Subscribed to course ${spliceCourseCode(courseId, ' ')}.`);
    },
    onError: (_, courseId) => {
      toast.error(
        `Failed to subscribe to course ${spliceCourseCode(courseId, ' ')}.`
      );
    },
  });
};

export const useRemoveSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => api.removeSubscription(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({
        queryKey: queryKeys.subscription(courseId),
      });
      toast.success(
        `Unsubscribed from course ${spliceCourseCode(courseId, ' ')}`
      );
    },
    onError: (_, courseId) => {
      toast.error(
        `Failed to unsubscribe from course ${spliceCourseCode(courseId, ' ')}`
      );
    },
  });
};

export const useInteractions = (
  courseId: string,
  userId: string,
  referrer: string | undefined
) => {
  return useQuery({
    queryKey: queryKeys.interactions(courseId, userId),
    queryFn: () => api.getInteractions(courseId, userId, referrer),
    enabled: !!courseId && !!userId,
    meta: {
      onError: (err: any) => {
        toast.error(err.toString());
      },
    },
  });
};

export const useCourseInteractions = (courseId: string, referrer: string) => {
  return useQuery({
    queryKey: queryKeys.courseInteractions(courseId, referrer),
    queryFn: () => api.getUserInteractionsForCourse(courseId, referrer),
    enabled: !!courseId && !!referrer,
  });
};

export const useAddInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      kind,
      courseId,
      userId,
      referrer,
    }: {
      kind: InteractionKind;
      courseId: string;
      userId: string;
      referrer: string | undefined;
    }) => api.addInteraction(kind, courseId, userId, referrer),
    onSuccess: (_, { kind, courseId, userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.interactions(courseId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseInteractions(courseId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseWithReviews(courseId),
      });
      toast.success(
        `Successfully ${kind}d review for ${spliceCourseCode(courseId, ' ')}.`
      );
    },
    onError: (err) => {
      toast.error(err.toString());
    },
  });
};

export const useRemoveInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      userId,
      referrer,
    }: {
      courseId: string;
      userId: string;
      referrer: string | undefined;
    }) => api.removeInteraction(courseId, userId, referrer),
    onSuccess: (_, { courseId, userId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.interactions(courseId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseInteractions(courseId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseWithReviews(courseId),
      });
      toast.success(
        `Successfully removed interaction for ${spliceCourseCode(
          courseId,
          ' '
        )}.`
      );
    },
    onError: (err) => {
      toast.error(err.toString());
    },
  });
};

export const useLikeReview = () => {
  const addInteractionMutation = useAddInteraction();
  const removeInteractionMutation = useRemoveInteraction();

  return {
    likeReview: (
      courseId: string,
      reviewUserId: string,
      currentUserId: string
    ) =>
      addInteractionMutation.mutate({
        kind: InteractionKind.Like,
        courseId,
        userId: reviewUserId,
        referrer: currentUserId,
      }),
    dislikeReview: (
      courseId: string,
      reviewUserId: string,
      currentUserId: string
    ) =>
      addInteractionMutation.mutate({
        kind: InteractionKind.Dislike,
        courseId,
        userId: reviewUserId,
        referrer: currentUserId,
      }),
    removeInteraction: (
      courseId: string,
      reviewUserId: string,
      currentUserId: string
    ) =>
      removeInteractionMutation.mutate({
        courseId,
        userId: reviewUserId,
        referrer: currentUserId,
      }),
    isLoading:
      addInteractionMutation.isPending || removeInteractionMutation.isPending,
  };
};

export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: api.getNotifications,
    meta: {
      onError: () => {
        toast.error('Failed to get notifications.');
      },
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      creatorId,
      seen,
    }: {
      courseId: string;
      creatorId: string;
      seen: boolean;
    }) => api.updateNotification(courseId, creatorId, seen),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
    onError: () => {
      toast.error('Failed to update notification.');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => api.deleteNotification(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      toast.success('Successfully deleted notification.');
    },
    onError: () => {
      toast.error('Failed to delete notification.');
    },
  });
};

export const useInstructor = (name: string) => {
  return useQuery({
    queryKey: queryKeys.instructor(name),
    queryFn: () => api.getInstructor(name),
    enabled: !!name,
  });
};

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => api.search(query),
    enabled: !!query && query.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: api.getUser,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
