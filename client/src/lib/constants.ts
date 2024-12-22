const { VITE_API_URL } = import.meta.env;

export const env = { VITE_API_URL: VITE_API_URL ?? '' };
