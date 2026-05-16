import { useState, useCallback } from 'react';

/**
 * Custom hook for client-side rate limiting.
 * @param {string} key - Unique key for the action (e.g., 'auth_login')
 * @param {number} limit - Max attempts
 * @param {number} windowMs - Time window in milliseconds
 */
export const useRateLimit = (key, limit = 5, windowMs = 60000) => {
  const [error, setError] = useState('');

  const checkLimit = useCallback(() => {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    const data = JSON.parse(localStorage.getItem(storageKey) || '{"count": 0, "reset": 0}');

    if (now > data.reset) {
      // Window expired, reset
      const newData = { count: 1, reset: now + windowMs };
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setError('');
      return true;
    }

    if (data.count >= limit) {
      const remainingSec = Math.ceil((data.reset - now) / 1000);
      setError(`Too many requests. Please wait ${remainingSec}s.`);
      return false;
    }

    // Increment count
    data.count += 1;
    localStorage.setItem(storageKey, JSON.stringify(data));
    setError('');
    return true;
  }, [key, limit, windowMs]);

  return { checkLimit, rateLimitError: error };
};
