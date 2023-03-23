export const fetchClient = {
  get: async function (endpoint: string, init?: RequestInit) {
    return await fetch('/api' + endpoint, init);
  },
  getData: async function <T>(endpoint: string, init?: RequestInit) {
    return (await (await this.get(endpoint, init)).json()) as T;
  },
  post: async (endpoint: string, data: any, init?: RequestInit) => {
    return await fetch(import.meta.env.VITE_API_URL + endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...init,
    });
  },
};
