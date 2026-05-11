import axios from 'axios';
import { getIdToken } from 'firebase/auth';
import { app as firebaseApp } from '../firebase/config';

// Environment-based configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://backend-worker.aris-22002-priyanto.workers.dev';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10s timeout to prevent infinite wait (DoS mitigation)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// LOCAL MOCK DATA STORE (Development Only)
// For CRUD operations when backend doesn't support write
// ============================================
interface MockStore {
  houses: Array<{ id: number;[key: string]: unknown }>;
  residents: Array<{ id: number;[key: string]: unknown }>;
  payments: Array<{ id: number;[key: string]: unknown }>;
  users: Array<{ uid: string;[key: string]: unknown }>;
}

const mockStore: MockStore = {
  houses: [],
  residents: [],
  payments: [],
  users: [],
};

const generateId = () => Math.floor(Date.now() * Math.random()) % 100000 + 1000;

// Development-only logging to prevent data leaks in production
const logDev = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log(...args);
};
const errorDev = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.error(...args);
};

// Helper to get Firebase token
const getFirebaseToken = async (): Promise<string | null> => {
  try {
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (user) {
      return await getIdToken(user);
    }
    return null;
  } catch (err) {
    errorDev('[Auth Token Error]', err);
    return null;
  }
};

// Request interceptor - inject Firebase token + logging
api.interceptors.request.use(
  async (config) => {
    logDev(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);

    // Inject Firebase ID token as Bearer token
    const token = await getFirebaseToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    errorDev('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and logging
api.interceptors.response.use(
  (response) => {
    logDev(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;

    if (status === 401 || status === 403) {
      errorDev(`[API Auth Error] ${status}: ${message}`);
      // Could trigger re-auth here
    } else if (status === 404) {
      logDev(`[API 404] ${error.config?.url} - Not found (expected in dev)`);
    } else if (status === 500) {
      errorDev(`[API Server Error] ${message}`);
    } else {
      errorDev(`[API Error] ${status || 'Network'}: ${message}`);
    }

    return Promise.reject(error);
  }
);

// ============================================
// Types
// ============================================
interface House {
  id: number;
  block: string;
  number: string;
  owner_name: string;
  phone?: string;
  email?: string;
  status?: string;
}

interface Resident {
  id: number;
  house_id: number;
  name: string;
  nik?: string;
  ktp_number?: string; // Alias for nik (NOMOR KTP)
  birth_date?: string;
  gender?: string;
  occupation?: string;
  phone?: string;
  email?: string;
  is_head?: boolean; // Optional - defaults to false (anggota keluarga)
}

interface Payment {
  id: number;
  house_id: number;
  month: number;
  year: number;
  amount: number;
  due_date?: string;
  paid_date?: string | null;
  status: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

interface ApiRow {
  id?: number | string;
  [key: string]: unknown;
}

// Helpers
const toNumber = (val: unknown, fallback = 0): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseInt(val, 10) || fallback;
  return fallback;
};

const toString = (val: unknown, fallback = '-'): string => {
  if (typeof val === 'string') return val || fallback;
  return fallback;
};

const toRows = (data: unknown): Array<ApiRow> => {
  if (!data) return [];
  if (Array.isArray(data)) return data as Array<ApiRow>;
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    // If data is wrapped in a 'data' or 'results' or 'rows' key
    if (obj.data && Array.isArray(obj.data)) return obj.data as Array<ApiRow>;
    if (obj.results && Array.isArray(obj.results)) return obj.results as Array<ApiRow>;
    if (obj.rows && Array.isArray(obj.rows)) return obj.rows as Array<ApiRow>;
  }
  return [];
};

// Mock users for development
const MOCK_USERS = [
  { uid: 'admin-001', email: 'aris.22002.priyanto@gmail.com', displayName: 'Admin RW', role: 'admin' },
  { uid: 'user-001', email: 'ketua.rt01@example.com', displayName: 'Ketua RT 01', role: 'rt' },
  { uid: 'user-002', email: 'warga@example.com', displayName: 'Warga', role: 'warga' },
];

// Helper to update user role in Firebase RTDB
const updateUserRole = async (userId: string, role: string): Promise<void> => {
  try {
    const { getDatabase, ref, set } = await import('firebase/database');
    const rtdb = getDatabase(firebaseApp);
    await set(ref(rtdb, `users/${userId}/role`), role);
    logDev(`[RoleContext] Updated role for ${userId} to ${role}`);
  } catch (err) {
    errorDev('[RoleContext] Failed to update role:', err);
    throw err;
  }
};

// Helper to get data snapshot for resume
const getDataSnapshot = async (): Promise<Record<string, unknown>> => {
  try {
    return await api.get('/api/snapshot').then(res => res.data);
  } catch {
    logDev('[API] Using mock snapshot data');
    return {
      houses: mockStore.houses.length || 25,
      residents: mockStore.residents.length || 80,
      payments: mockStore.payments.length || 150,
      events: 12,
    };
  }
};

const buildResume = (data: Record<string, unknown>) => ({
  totalHouses: data.houses as number,
  totalResidents: data.residents as number,
  totalPayments: data.payments as number,
  recentEvents: data.events as number,
  // Aliases for WargaHome.tsx ResumeData interface
  totalPosts: data.payments as number || 0,
  totalUsers: MOCK_USERS.length,
  totalActivities: 0,
  upcomingAgendas: Math.floor((data.events as number) || 0 / 3),
  totalCommunities: 0,
  totalOrganizations: 0,
  totalEvents: (data.events as number) || 0,
  totalProducts: 0,
  recentPosts: [],
  upcomingEvents: [],
});

// Build Stats - matches Dashboard.tsx StatsData interface
const buildStats = (data: Record<string, unknown>) => ({
  totalHouses: (data.houses as number) || 0,
  occupiedHouses: Math.floor(((data.houses as number) || 0) * 0.85),
  totalResidents: (data.residents as number) || 0,
  monthlyRevenue: ((data.payments as number) || 0) * 250000,
  totalUsers: MOCK_USERS.length,
  totalActivities: 0,
  totalPosts: 0,
  upcomingAgendas: 0,
  totalCommunities: 0,
  totalOrganizations: 0,
  totalEvents: (data.events as number) || 0,
  totalProducts: 0,
  recentUpdates: ['Data diambil dari API Backend', 'Update terakhir: Sekarang'],
});

// ============================================
// API Endpoints (with Mock Fallback for DEV)
// ============================================

// Houses API
export const housesApi = {
  getAll: () => api.get('/api/houses').then(res => res.data),
  create: (data: Omit<House, 'id'>) => {
    if (import.meta.env.DEV) {
      const newHouse = { ...data, id: generateId() };
      mockStore.houses.push(newHouse as MockStore['houses'][number]);
      return Promise.resolve(newHouse);
    }
    return api.post('/api/houses', data).then(res => res.data);
  },
  update: (id: number, data: Partial<House>) => {
    if (import.meta.env.DEV) {
      const idx = mockStore.houses.findIndex(h => h.id === id);
      if (idx >= 0) {
        mockStore.houses[idx] = { ...mockStore.houses[idx], ...data };
        return Promise.resolve(mockStore.houses[idx]);
      }
    }
    return api.put(`/api/houses/${id}`, data).then(res => res.data);
  },
  delete: (id: number) => {
    if (import.meta.env.DEV) {
      mockStore.houses = mockStore.houses.filter(h => h.id !== id);
      return Promise.resolve({ success: true });
    }
    return api.delete(`/api/houses/${id}`).then(res => res.data);
  },
};

// Residents API
export const residentsApi = {
  getAll: async (): Promise<Array<Resident & { block: string; number: string }>> => {
    const [residents, houses] = await Promise.all([
      api.get('/api/residents').then((res) => toRows(res.data)),
      api.get('/api/houses').then((res) => toRows(res.data)),
    ]);
    const houseMap = new Map<number, ApiRow>(houses.map((house) => [toNumber(house.id), house]));
    return residents.map((resident, index) => {
      const houseId = toNumber(resident.house_id);
      const house = houseMap.get(houseId);
      return {
        ...resident,
        id: toNumber(resident.id, index + 1),
        house_id: houseId,
        block: toString(house?.block),
        number: toString(house?.number),
      } as Resident & { block: string; number: string };
    });
  },
  create: (data: Omit<Resident, 'id'>) => {
    if (import.meta.env.DEV) {
      const newResident = { ...data, id: generateId() };
      mockStore.residents.push(newResident as MockStore['residents'][number]);
      return Promise.resolve(newResident);
    }
    return api.post('/api/residents', data).then(res => res.data);
  },
  update: (id: number, data: Partial<Resident>) => {
    if (import.meta.env.DEV) {
      const idx = mockStore.residents.findIndex(r => r.id === id);
      if (idx >= 0) {
        mockStore.residents[idx] = { ...mockStore.residents[idx], ...data };
        return Promise.resolve(mockStore.residents[idx]);
      }
    }
    return api.put(`/api/residents/${id}`, data).then(res => res.data);
  },
  delete: (id: number) => {
    if (import.meta.env.DEV) {
      mockStore.residents = mockStore.residents.filter(r => r.id !== id);
      return Promise.resolve({ success: true });
    }
    return api.delete(`/api/residents/${id}`).then(res => res.data);
  },
};

// Payments API
export const paymentsApi = {
  getAll: async (month: number, year: number): Promise<Array<Payment & { block: string; number: string }>> => {
    const [payments, houses] = await Promise.all([
      api.get('/api/payments', { params: { month, year } }).then((res) => toRows(res.data)),
      api.get('/api/houses').then((res) => toRows(res.data)),
    ]);
    const houseMap = new Map<number, ApiRow>(houses.map((house) => [toNumber(house.id), house]));
    return payments
      .filter((payment) => toNumber(payment.month) === month && toNumber(payment.year) === year)
      .map((payment) => {
        const house = houseMap.get(toNumber(payment.house_id));
        return {
          ...payment,
          block: toString(house?.block, '-'),
          number: toString(house?.number, '-'),
        } as Payment & { block: string; number: string };
      });
  },
  generate: (month: number, year: number) => api.post('/api/payments/generate', { month, year }).then(res => res.data),
  pay: (id: number, data: Partial<Payment>) => api.put(`/api/payments/${id}/pay`, data).then(res => res.data),
  create: (data: Omit<Payment, 'id'>) => {
    if (import.meta.env.DEV) {
      const newPayment = { ...data, id: generateId() };
      mockStore.payments.push(newPayment as MockStore['payments'][number]);
      return Promise.resolve(newPayment);
    }
    return api.post('/api/payments', data).then(res => res.data);
  },
  update: (id: number, data: Partial<Payment>) => {
    if (import.meta.env.DEV) {
      const idx = mockStore.payments.findIndex(p => p.id === id);
      if (idx >= 0) {
        mockStore.payments[idx] = { ...mockStore.payments[idx], ...data };
        return Promise.resolve(mockStore.payments[idx]);
      }
    }
    return api.put(`/api/payments/${id}`, data).then(res => res.data);
  },
  delete: (id: number) => {
    if (import.meta.env.DEV) {
      mockStore.payments = mockStore.payments.filter(p => p.id !== id);
      return Promise.resolve({ success: true });
    }
    return api.delete(`/api/payments/${id}`).then(res => res.data);
  },
};

// Products API
export const getProducts = () => api.get('/api/products').then(res => res.data);
export const productsApi = {
  getAll: () => api.get('/api/products').then(res => res.data),
  create: (data: Omit<Product, 'id'>) => {
    if (import.meta.env.DEV) {
      const newProduct = { ...data, id: generateId() };
      return Promise.resolve(newProduct);
    }
    return api.post('/api/products', data).then(res => res.data);
  },
  update: (id: number, data: Partial<Product>) => {
    if (import.meta.env.DEV) {
      return Promise.resolve({ id, ...data });
    }
    return api.put(`/api/products/${id}`, data).then(res => res.data);
  },
  delete: (id: number) => {
    if (import.meta.env.DEV) {
      return Promise.resolve({ success: true });
    }
    return api.delete(`/api/products/${id}`).then(res => res.data);
  },
};

// Posts API
export const getPosts = () => api.get('/api/posts').then(res => res.data);
export const postsApi = {
  getAll: () => api.get('/api/posts').then(res => res.data),
  create: (data: Omit<Post, 'id'>) => {
    if (import.meta.env.DEV) {
      const newPost = { ...data, id: generateId() };
      return Promise.resolve(newPost);
    }
    return api.post('/api/posts', data).then(res => res.data);
  },
  update: (id: number, data: Partial<Post>) => {
    if (import.meta.env.DEV) {
      return Promise.resolve({ id, ...data });
    }
    return api.put(`/api/posts/${id}`, data).then(res => res.data);
  },
  delete: (id: number) => {
    if (import.meta.env.DEV) {
      return Promise.resolve({ success: true });
    }
    return api.delete(`/api/posts/${id}`).then(res => res.data);
  },
};

// Resume & Stats
export const getResume = () => getDataSnapshot().then(buildResume);
export const getStats = () => getDataSnapshot().then(buildStats);

// Events & Activities
export const getEvents = () => api.get('/api/kegiatan').then(res => res.data);
export const kegiatanApi = {
  getAll: () => api.get('/api/kegiatan').then(res => res.data),
  create: (data: unknown) => api.post('/api/kegiatan', data).then(res => res.data),
  update: (id: number, data: unknown) => api.put(`/api/kegiatan/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/api/kegiatan/${id}`).then(res => res.data),
};

// Users API
export const usersApi = {
  getAll: async (): Promise<Array<{ uid: string; email: string; displayName: string; role: string }>> => {
    try {
      const response = await api.get('/api/users').then(res => res.data);
      return response;
    } catch {
      logDev('[API] Using mock users data (backend /api/users not implemented)');
      return MOCK_USERS;
    }
  },
  getById: async (uid: string): Promise<{ uid: string; email: string; displayName: string; role: string } | null> => {
    try {
      return await api.get(`/api/users/${uid}`).then(res => res.data);
    } catch {
      return MOCK_USERS.find(u => u.uid === uid) || null;
    }
  },
  updateRole: (userId: string, role: string) => updateUserRole(userId, role),
  create: async (data: { email: string; displayName: string; role: string }): Promise<{ uid: string }> => {
    if (import.meta.env.DEV) {
      const newUser = { uid: `user-${generateId()}`, ...data };
      mockStore.users.push(newUser as MockStore['users'][number]);
      return { uid: newUser.uid };
    }
    logDev('[API] Create user via Firebase Auth:', data);
    return { uid: `user-${Date.now()}` };
  },
  update: async (id: string, data: Partial<{ displayName: string; role: string }>): Promise<void> => {
    if (import.meta.env.DEV) {
      const idx = mockStore.users.findIndex(u => u.id === id || u.uid === id);
      if (idx >= 0) {
        mockStore.users[idx] = { ...mockStore.users[idx], ...data };
        return;
      }
    }
    logDev('[API] Update user:', id, data);
  },
  delete: async (id: string): Promise<void> => {
    if (import.meta.env.DEV) {
      mockStore.users = mockStore.users.filter(u => u.id !== id && u.uid !== id);
      return;
    }
    logDev('[API] Delete user:', id);
  },
};

// Export the api instance for direct use
export { api };

// Export mock store for debugging
export { mockStore };

// ============================================
// Missing API Exports (stubbed for DEV)
// ============================================

// WebSocket endpoint
export const WS_ENDPOINT = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

// Agenda API
export const getAgendas = (params?: { month?: number; year?: number }) => {
  const query = params ? `?month=${params.month || new Date().getMonth() + 1}&year=${params.year || new Date().getFullYear()}` : '';
  return api.get(`/api/agendas${query}`).then(res => res.data);
};

// Activities API
export const activitiesApi = {
  getAll: () => api.get('/api/activities').then(res => res.data),
  create: (data: unknown) => api.post('/api/activities', data).then(res => res.data),
  update: (id: number | string, data: unknown) => api.put(`/api/activities/${id}`, data).then(res => res.data),
  delete: (id: number | string) => api.delete(`/api/activities/${id}`).then(res => res.data),
};

// Komunitas API
export const komunitasApi = {
  getAll: () => api.get('/api/komunitas').then(res => res.data),
  create: (data: unknown) => api.post('/api/komunitas', data).then(res => res.data),
  update: (id: number, data: unknown) => api.put(`/api/komunitas/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/api/komunitas/${id}`).then(res => res.data),
};

// Organizations API
export const getOrganizations = () => api.get('/api/organizations').then(res => res.data);
