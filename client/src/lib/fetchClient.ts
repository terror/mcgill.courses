export const fetchClient = {
  async get(endpoint: string, init?: RequestInit) {
    return fetch('/api' + endpoint, init);
  },
  async getData<T>(endpoint: string, init?: RequestInit) {
    return (await (await this.get(endpoint, init)).json()) as T;
  },
  async postData<T>(endpoint: string, data: any, init?: RequestInit) {
    return (await (
      await this.reqWithBody(endpoint, 'POST', data, init)
    ).json()) as T;
  },
  async reqWithBody(
    endpoint: string,
    method: string,
    data: any,
    init?: RequestInit
  ) {
    return fetch('/api' + endpoint, {
      method,
      body: JSON.stringify(data),
      ...init,
    });
  },
  async post(endpoint: string, data: any, init?: RequestInit) {
    return this.reqWithBody(endpoint, 'POST', data, init);
  },
  async put(endpoint: string, data: any, init?: RequestInit) {
    return this.reqWithBody(endpoint, 'PUT', data, init);
  },
  async delete(endpoint: string, data: any, init?: RequestInit) {
    return this.reqWithBody(endpoint, 'DELETE', data, init);
  },
};
