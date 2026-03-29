export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const getToken = () => localStorage.getItem('coinly_token');
export const setToken = (token) => localStorage.setItem('coinly_token', token);
export const clearToken = () => localStorage.removeItem('coinly_token');

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
};

export const fetchWithAuthForm = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // When sending FormData, we must NOT set Content-Type header manually
  // so the browser can set the boundary automatically.
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response;
};
