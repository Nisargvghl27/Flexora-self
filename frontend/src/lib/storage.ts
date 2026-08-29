// Utility functions for username-specific localStorage operations

export const getStorageKey = (baseKey: string, username?: string) => {
  return username ? `${baseKey}-${username}` : baseKey;
};

export const getStorageData = (baseKey: string, username?: string, defaultValue: any = null) => {
  const key = getStorageKey(baseKey, username);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

export const setStorageData = (baseKey: string, data: any, username?: string) => {
  const key = getStorageKey(baseKey, username);
  localStorage.setItem(key, JSON.stringify(data));
};

export const removeStorageData = (baseKey: string, username?: string) => {
  const key = getStorageKey(baseKey, username);
  localStorage.removeItem(key);
};

// Common storage keys
export const STORAGE_KEYS = {
  CART: 'flexora-cart',
  ORDERS: 'flexora-orders',
  FAVORITES: 'flexora-favorites',
  SAVED_ADDRESSES: 'flexora-saved-addresses',
  MEMBER_SINCE: 'flexora-member-since',
  LAST_LOGIN: 'flexora-last-login',
  LIKED_POSTS: 'flexora-liked-posts',
  FAVORITE_POSTS: 'flexora-favorite-posts',
  SWIPE_RESULTS: 'flexora-swipe-results',
} as const; 