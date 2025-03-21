import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Home endpoints
export const homeService = {
  get: () => api.get('/home'),
  update: (data: object) => api.put('/home', data),
};

// Blog endpoints
export const blogService = {
  getAll: () => api.get('/blogs'),
  getById: (id: string) => api.get(`/blogs/${id}`),
  create: (data: object) => api.post('/blogs', data),
  update: (id: string, data: object) => api.put(`/blogs/${id}`, data),
  delete: (id: string) => api.delete(`/blogs/${id}`),
};

// Portfolio/Projects endpoints
export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: object) => api.post('/projects', data),
  update: (id: string, data: object) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// About page endpoints
export const aboutService = {
  get: () => api.get('/about'),
  update: (data: object) => api.put('/about', data),
};

// Contact endpoints
export const contactService = {
  getAll: () => api.get('/contact'),
  update: (data: object) => api.put(`/contact`, data),
  getAllMessages:  () => api.get('/contact/messages'),
  delete: (id: string) => api.delete(`/contact/messages/${id}`),
  createMessage: (data: never) => api.post('/contact/messages', data),
};

// Footer endpoints 
export const footerService = {
  get: () => api.get('/footer'),
  update: (data: any) => api.put('/footer', data),
};

// Navbar endpoints
export const navbarService = {
  get: () => api.get('/navbar'),
  update: (data: any) => api.put('/navbar', data),
};

// Mevcut servislere ekleyin
export const dashboardService = {
    getStats: () => api.get('/dashboard/stats'),
    getRecentPosts: () => api.get('/dashboard/recent-posts'),
    getRecentMessages: () => api.get('/dashboard/recent-messages'),
};

// Auth endpoints
export const authService = {
    login: (data: { email: string; password: string }) => 
        api.post('/auth/login', data, { withCredentials: true }),
    register: (data: { name: string; email: string; password: string; role: string }) => 
        api.post('/auth/register', data, { withCredentials: true }),
    me: () => api.get('/auth/me', { withCredentials: true }),
    logout: () => api.post('/auth/logout', {}, { withCredentials: true }),
    getAllUsers: () => api.get('/auth/users'),
    updateUser: (id: number, data: { name: string; email: string; role: string }) => 
        api.put(`/auth/users/${id}`, data),
    deleteUser: (id: number) => api.delete(`/auth/users/${id}`),
};

// Upload endpoints
export const uploadService = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Axios interceptor'ları güncelle
api.interceptors.request.use(
    (config) => {
        // FormData için Content-Type header'ını otomatik olarak ayarla
        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        }
        config.withCredentials = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;