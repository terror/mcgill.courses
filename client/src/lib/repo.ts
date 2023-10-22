import type { Course } from '../model/Course';
import type { GetCourseWithReviewsPayload } from '../model/GetCourseWithReviewsPayload';
import type { GetInstructorPayload } from '../model/GetInstructorPayload';
import type { GetInteractionsPayload } from '../model/GetInteractionsPayload';
import type { InteractionKind } from '../model/Interaction';
import type { Notification } from '../model/Notification';
import type { Review } from '../model/Review';
import type { SearchResults } from '../model/SearchResults';
import type { Subscription } from '../model/Subscription';
import type { UserResponse } from '../model/User';

const prefix = '/api';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

const client = {
  async get(endpoint: string, init?: RequestInit): Promise<Response> {
    return fetch(prefix + endpoint, init);
  },

  async post(endpoint: string, init?: RequestInit): Promise<Response> {
    return fetch(prefix + endpoint, {
      method: 'POST',
      ...init,
    });
  },

  async put(endpoint: string, init?: RequestInit): Promise<Response> {
    return fetch(prefix + endpoint, {
      method: 'PUT',
      ...init,
    });
  },

  async delete(endpoint: string, init?: RequestInit): Promise<Response> {
    return fetch(prefix + endpoint, {
      method: 'DELETE',
      ...init,
    });
  },

  async deserialize<T>(
    method: Method,
    endpoint: string,
    init?: RequestInit
  ): Promise<T> {
    const run = async (
      fn: (endpoint: string, init?: RequestInit) => Promise<Response>
    ): Promise<T> => (await (await fn(endpoint, init)).json()) as T;

    switch (method) {
      case 'GET':
        return run(this.get);
      case 'POST':
        return run(this.post);
      case 'PUT':
        return run(this.put);
      case 'DELETE':
        return run(this.delete);
    }
  },
};

export const repo = {
  async getSubscription(courseId: string): Promise<Subscription | null> {
    return client.deserialize<Subscription | null>(
      'GET',
      `/subscriptions?course_id=${courseId}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },

  async getSubscriptions(): Promise<Subscription[]> {
    return client.deserialize<Subscription[]>('GET', '/subscriptions', {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async addSubcription(courseId: string): Promise<Response> {
    return client.post('/subscriptions', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId }),
    });
  },

  async removeSubscription(courseId: string): Promise<Response> {
    return client.delete('/subscriptions', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId }),
    });
  },

  async getReviews(userId: string): Promise<Review[]> {
    return client.deserialize<Review[]>('GET', `/reviews?user_id=${userId}`);
  },

  async addReview(courseId: string, values: any): Promise<Response> {
    return client.post(`/reviews`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        ...values,
      }),
    });
  },

  async updateReview(courseId: string, values: any): Promise<Response> {
    return client.put(`/reviews`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        ...values,
      }),
    });
  },

  async deleteReview(courseId: string): Promise<Response> {
    return client.delete('/reviews', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId }),
    });
  },

  async getInteractions(
    courseId: string,
    userId: string,
    referrer: string | undefined
  ): Promise<GetInteractionsPayload> {
    return client.deserialize<GetInteractionsPayload>(
      'GET',
      `/interactions?course_id=${courseId}&user_id=${userId}&referrer=${referrer}`
    );
  },

  async addInteraction(
    kind: InteractionKind,
    courseId: string,
    userId: string,
    referrer: string | undefined
  ): Promise<Response> {
    return client.post('/interactions', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind,
        course_id: courseId,
        user_id: userId,
        referrer,
      }),
    });
  },

  async removeInteraction(
    courseId: string,
    userId: string,
    referrer: string | undefined
  ): Promise<Response> {
    return client.delete('/interactions', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        user_id: userId,
        referrer,
      }),
    });
  },

  async getNotifications(): Promise<Notification[]> {
    return client.deserialize<Notification[]>('GET', '/notifications');
  },

  async updateNotification(
    courseId: string,
    creatorId: string,
    seen: boolean
  ): Promise<Response> {
    return client.put('/notifications', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        creator_id: creatorId,
        seen: seen,
      }),
    });
  },

  async deleteNotification(courseId: string): Promise<Response> {
    return client.delete('/notifications', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId }),
    });
  },

  async search(query: string): Promise<SearchResults> {
    return client.deserialize<SearchResults>(
      'GET',
      `/search?query=${encodeURIComponent(query)}`
    );
  },

  async getCourseWithReviews(
    id: string | undefined
  ): Promise<GetCourseWithReviewsPayload | null> {
    return client.deserialize<GetCourseWithReviewsPayload | null>(
      'GET',
      `/courses/${id}?with_reviews=true`
    );
  },

  async getCourses(
    limit: number,
    offset: number,
    filters: any
  ): Promise<Course[]> {
    return client.deserialize<Course[]>(
      'POST',
      `/courses?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      }
    );
  },

  async getInstructor(name: string): Promise<GetInstructorPayload> {
    return client.deserialize<GetInstructorPayload>(
      'GET',
      `/instructors/${decodeURIComponent(name)}`
    );
  },

  async getUser(): Promise<UserResponse> {
    return client.deserialize<UserResponse>('GET', '/user', {
      credentials: 'include',
    });
  },
};
