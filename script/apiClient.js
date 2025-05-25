import { withAuthProxy } from '../server/utils/authProxy.js';
import { logger } from './logger.js';

const strategies = {
  cookie: async () => ({}),
};

const renewCookie = async (_name, _config) => {
  const res = await fetch('/api/v1/users/refreshToken', {
    method: 'POST',
    creditials: 'include',
  });
  if (!res.ok) {
    throw new Error('Unable to refresh JWT cookie');
  }
};

let calls = 0;
let reset = Date.now() + 60_000;
const limiter = async () => {
  if (Date.now() > reset) {
    reset = Date.now() + 60_000;
    calls = 0;
  }
  if (calls++ >= 60) {
    throw new Error('Rate limit exceeded');
  }
};

export const apiFetch = withAuthProxy(fetch, {
  strategies,
  defaultStrategy: 'cookie',
  onRenew: () => {},
  limiter,
  logger,
});

export const apiJSON = async (url, options = {}) => {
  const res = await apiFetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || `API error ${res.status}`);
    err.status = res.status;
    err.errors = data.details || data.errors || null;
    throw err;
  }

  return data;
};
