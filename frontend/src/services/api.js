/**
 * Service API pour communiquer avec le backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Wrapper fetch avec gestion des erreurs et authentification
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Une erreur est survenue');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ===========================================
// Auth API
// ===========================================

export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),

  getMe: () => apiRequest('/auth/me'),

  changePassword: (passwords) => apiRequest('/auth/password', {
    method: 'PUT',
    body: JSON.stringify(passwords),
  }),
};

// ===========================================
// Projects API
// ===========================================

export const projectsAPI = {
  getAll: () => apiRequest('/projects'),

  getOne: (id) => apiRequest(`/projects/${id}`),

  create: (projectData) => apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  update: (id, projectData) => apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),

  delete: (id) => apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  }),
};

// ===========================================
// Tasks API
// ===========================================

export const tasksAPI = {
  getAll: () => apiRequest('/tasks'),

  getOne: (id) => apiRequest(`/tasks/${id}`),

  create: (taskData) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),

  update: (id, taskData) => apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }),

  delete: (id) => apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  }),
};

// ===========================================
// Notes API
// ===========================================

export const notesAPI = {
  getAll: () => apiRequest('/notes'),

  getOne: (id) => apiRequest(`/notes/${id}`),

  create: (noteData) => apiRequest('/notes', {
    method: 'POST',
    body: JSON.stringify(noteData),
  }),

  update: (id, noteData) => apiRequest(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(noteData),
  }),

  delete: (id) => apiRequest(`/notes/${id}`, {
    method: 'DELETE',
  }),
};

// ===========================================
// Events API
// ===========================================

export const eventsAPI = {
  getAll: () => apiRequest('/events'),

  getOne: (id) => apiRequest(`/events/${id}`),

  create: (eventData) => apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),

  update: (id, eventData) => apiRequest(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  }),

  delete: (id) => apiRequest(`/events/${id}`, {
    method: 'DELETE',
  }),
};

// ===========================================
// Time Tracking API
// ===========================================

export const timeAPI = {
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiRequest(`/time${query}`);
  },

  create: (timeEntryData) => apiRequest('/time', {
    method: 'POST',
    body: JSON.stringify(timeEntryData),
  }),
};

// ===========================================
// User API
// ===========================================

export const userAPI = {
  getProfile: () => apiRequest('/user/profile'),

  updateProfile: (userData) => apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};
