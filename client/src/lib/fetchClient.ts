import { Subscription } from '../model/Subscription';

const prefix = '/api';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const fetchClient = {
  async get(endpoint: string, init?: RequestInit) {
    return fetch(prefix + endpoint, init);
  },

  async post(endpoint: string, init?: RequestInit) {
    return fetch(prefix + endpoint, {
      method: 'POST',
      ...init,
    });
  },

  async put(endpoint: string, init?: RequestInit) {
    return fetch(prefix + endpoint, {
      method: 'PUT',
      ...init,
    });
  },

  async delete(endpoint: string, init?: RequestInit) {
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
    return await fetchClient.deserialize<Subscription | null>(
      'GET',
      `/subscriptions?course_id=${courseId}`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },

  async addSubcription(courseId: string): Promise<void> {
    await fetchClient.post('/subscriptions', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId }),
    });
  },

  async removeSubscription(courseId: string): Promise<void> {
    await fetchClient.delete('/subscriptions', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: courseId }),
    });
  },
};
