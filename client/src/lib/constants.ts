const { VITE_API_URL, VITE_GOOGLE_API_KEY } = import.meta.env;

export const env = {
  VITE_API_URL: VITE_API_URL ?? '',
  VITE_GOOGLE_API_KEY: VITE_GOOGLE_API_KEY ?? '',
};
