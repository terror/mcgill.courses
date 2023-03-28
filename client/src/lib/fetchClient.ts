export const fetchClient = {
  async get(endpoint: string, init?: RequestInit) {
    return fetch('/api' + endpoint, init);
  },
  async getData<T>(endpoint: string, init?: RequestInit) {
    return (await (await this.get(endpoint, init)).json()) as T;
  },
  post: async (endpoint: string, data: any, init?: RequestInit) => {
    return fetch('/api' + endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...init,
    });
  },
};
