import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getActivities = () => api.get('/activities').then(res => res.data);
export const getOrganizations = () => api.get('/organizations').then(res => res.data);
export const getProducts = () => api.get('/products').then(res => res.data);
export const getPosts = () => api.get('/posts').then(res => res.data);
export const getResume = () => api.get('/resume').then(res => res.data);
export const getStats = () => api.get('/stats').then(res => res.data);

export const housesApi = {
  getAll: () => api.get('/houses').then(res => res.data),
  create: (data: any) => api.post('/houses', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/houses/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/houses/${id}`).then(res => res.data),
};

export const residentsApi = {
  getAll: () => api.get('/residents').then(res => res.data),
  create: (data: any) => api.post('/residents', data).then(res => res.data),
  update: (id: number, data: any) => api.put(`/residents/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/residents/${id}`).then(res => res.data),
};

export const paymentsApi = {
  getAll: (month: number, year: number) => api.get('/payments', { params: { month, year } }).then(res => res.data),
  generate: (month: number, year: number) => api.post('/payments/generate', { month, year }).then(res => res.data),
  pay: (id: number, data: any) => api.put(`/payments/${id}/pay`, data).then(res => res.data),
};

export const getEvents = () => api.get('/kegiatan').then(res => res.data);
export const kegiatanApi = {
  getAll: () => api.get('/kegiatan').then(res => res.data),
  create: (data: any) => api.post('/kegiatan', data).then(res => res.data),
  delete: (id: number) => api.delete(`/kegiatan/${id}`).then(res => res.data),
};

export const getCommunities = () => api.get('/komunitas').then(res => res.data);
export const komunitasApi = {
  getAll: () => api.get('/komunitas').then(res => res.data),
  create: (data: any) => api.post('/komunitas', data).then(res => res.data),
  delete: (id: number) => api.delete(`/komunitas/${id}`).then(res => res.data),
};

export const getAgendas = (params: { month: number; year: number }) =>
  api.get('/agendas', { params }).then(res => res.data);

export default api;
