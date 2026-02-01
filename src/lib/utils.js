import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** API base URL: full backend URL in production (VITE_API_URL), /api when using dev proxy */
export function getApiBase() {
  const base = import.meta.env.VITE_API_URL;
  if (base && typeof base === 'string') {
    return base.replace(/\/$/, '') + '/api';
  }
  return '/api';
}

/** Origin for /api/media paths: backend URL in production so media loads from API server */
export function getMediaOrigin() {
  const base = import.meta.env.VITE_API_URL;
  if (base && typeof base === 'string') {
    return base.replace(/\/$/, '');
  }
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/** Build full URL for a path like /api/media/avatars/xxx */
export function getMediaUrl(path) {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const origin = getMediaOrigin();
  return origin ? `${origin}${path.startsWith('/') ? path : '/' + path}` : path;
}
