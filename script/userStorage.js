import { apiJSON } from './apiClient.js';

let userPromise = null;
const KEY = 'cachedUser';
const TTL = 10 * 60 * 1000; // 10 minutes

export const getCurrentUser = () => {
  if (userPromise) return userPromise;

  const cached = sessionStorage.getItem(KEY);
  if (cached) {
    const { data, ts } = JSON.parse(cached);
    if (Date.now() - ts < TTL) {
      userPromise = Promise.resolve(data);
      return userPromise;
    }
  }
  userPromise = apiJSON('http://localhost:3000/api/v1/users/me')
    .then((res) => {
      const { user } = res.data;
      sessionStorage.setItem(
        KEY,
        JSON.stringify({ data: user, ts: Date.now() }),
      );
      return user;
    })
    .catch((err) => {
      userPromise = null;
      throw err;
    });

  return userPromise;
};

export const clearUserCache = () => {
  if (!sessionStorage.getItem(KEY)) return;
  userPromise = null;
  sessionStorage.removeItem(KEY);
};
