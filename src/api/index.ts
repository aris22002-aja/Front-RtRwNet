import axios from 'axios';

const DEFAULT_STAGING_API_URL = '/api';
const API_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_STAGING_API_URL).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10s timeout to prevent infinite wait (DoS mitigation)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Development-only logging to prevent data leaks in production
const logDev = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log(...args);
};
const errorDev = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.error(...args);
};

// Request interceptor - log semua request untuk debugging
api.interceptors.request.use(
  (config) => {
    logDev(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    errorDev('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - tangani error dengan lebih baik
api.interceptors.response.use(
  (response) => {
    logDev(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server merespons dengan status error (4xx, 5xx)
      errorDev('[API Error Response]', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      // Remove alert(), let components handle errors
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      errorDev('[API No Response]', error.request);
    } else {
      // Error saat setup request
      errorDev('[API Setup Error]', error.message);
    }
    return Promise.reject(error);
  }
);

type ApiRow = Record<string, unknown>;

interface DataSnapshot {
  activities: ApiRow[];
  organizations: ApiRow[];
  products: ApiRow[];
  posts: ApiRow[];
  agendas: ApiRow[];
  kegiatan: ApiRow[];
  komunitas: ApiRow[];
  houses: ApiRow[];
  residents: ApiRow[];
  payments: ApiRow[];
}

interface DashboardStats {
  totalHouses: number;
  occupiedHouses: number;
  totalResidents: number;
  monthlyRevenue: number;
  totalUsers: number;
  totalActivities: number;
  totalPosts: number;
  upcomingAgendas: number;
  totalCommunities: number;
  totalOrganizations: number;
  totalEvents: number;
  totalProducts: number;
  recentUpdates: string[];
}

interface ResumeSummary {
  totalPosts: number;
  totalUsers: number;
  totalActivities: number;
  upcomingAgendas: number;
  totalCommunities: number;
  totalOrganizations: number;
  totalEvents: number;
  totalProducts: number;
  recentPosts: Array<{ title: string; excerpt: string; date: string }>;
  upcomingEvents: Array<{ name: string; date: string; location: string }>;
}

// Type definitions for API entities
interface Organization {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  date: string;
}

interface House {
  id: number;
  block: string;
  number: string;
  status: string;
}

interface Resident {
  id: number;
  name: string;
  house_id: number;
  phone?: string;
}

interface Payment {
  id: number;
  house_id: number;
  month: number;
  year: number;
  amount: number;
  status: string;
}

interface Agenda {
  id: number;
  title: string;
  event_date: string;
  location?: string;
  description?: string;
}

interface Kegiatan {
  id: number;
  title: string;
  date: string;
  location?: string;
}

interface Komunitas {
  id: number;
  name: string;
  description?: string;
}

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return fallback;
};

const toString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const toRows = (value: unknown): ApiRow[] =>
  Array.isArray(value) ? value.filter((item): item is ApiRow => !!item && typeof item === 'object') : [];

// Fungsi getDataSnapshot yang baru – tidak lagi bergantung pada endpoint /data
const getDataSnapshot = async (): Promise<DataSnapshot> => {
  const [
    activities,
    organizations,
    products,
    posts,
    agendas,
    kegiatan,
    komunitas,
    houses,
    residents,
    payments,
  ] = await Promise.all([
    api.get('/activities').then(res => res.data).catch(() => []),
    api.get('/organizations').then(res => res.data).catch(() => []),
    api.get('/products').then(res => res.data).catch(() => []),
    api.get('/posts').then(res => res.data).catch(() => []),
    api.get('/agendas').then(res => res.data).catch(() => []),
    api.get('/kegiatan').then(res => res.data).catch(() => []),
    api.get('/komunitas').then(res => res.data).catch(() => []),
    api.get('/houses').then(res => res.data).catch(() => []),
    api.get('/residents').then(res => res.data).catch(() => []),
    api.get('/payments').then(res => res.data).catch(() => []),
  ]);

  return {
    activities: toRows(activities),
    organizations: toRows(organizations),
    products: toRows(products),
    posts: toRows(posts),
    agendas: toRows(agendas),
    kegiatan: toRows(kegiatan),
    komunitas: toRows(komunitas),
    houses: toRows(houses),
    residents: toRows(residents),
    payments: toRows(payments),
  };
};

const buildStats = (snapshot: DataSnapshot): DashboardStats => {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const occupiedHouses = snapshot.houses.filter((house) => {
    const status = toString(house.status).toLowerCase();
    return status !== '' && status !== 'vacant' && status !== 'kosong';
  }).length;

  const monthlyRevenue = snapshot.payments
    .filter((payment) => {
      const status = toString(payment.status).toLowerCase();
      const isPaid = status === 'paid' || status === 'lunas' || status === 'terbayar';
      return isPaid && toNumber(payment.month) === thisMonth && toNumber(payment.year) === thisYear;
    })
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  const recentUpdates = snapshot.activities
    .slice(0, 5)
    .map((activity) => {
      const title = toString(activity.title);
      const description = toString(activity.description);
      if (title && description) return `${title} - ${description}`;
      return title || description;
    })
    .filter((item): item is string => item.length > 0);

  return {
    totalHouses: snapshot.houses.length,
    occupiedHouses,
    totalResidents: snapshot.residents.length,
    monthlyRevenue,
    totalUsers: snapshot.residents.length,
    totalActivities: snapshot.activities.length,
    totalPosts: snapshot.posts.length,
    upcomingAgendas: snapshot.agendas.length,
    totalCommunities: snapshot.komunitas.length,
    totalOrganizations: snapshot.organizations.length,
    totalEvents: snapshot.kegiatan.length,
    totalProducts: snapshot.products.length,
    recentUpdates,
  };
};

const buildResume = (snapshot: DataSnapshot): ResumeSummary => {
  const recentPosts = snapshot.posts.slice(0, 3).map((post) => ({
    title: toString(post.title, 'Tanpa judul'),
    excerpt: toString(post.content || post.excerpt).slice(0, 120),
    date: toString(post.date, '-'),
  }));

  const upcomingEvents = [...snapshot.agendas, ...snapshot.kegiatan]
    .slice(0, 5)
    .map((event) => ({
      name: toString(event.title, 'Kegiatan'),
      date: toString(event.event_date || event.date, '-'),
      location: toString(event.location, '-'),
    }));

  return {
    totalPosts: snapshot.posts.length,
    totalUsers: snapshot.residents.length,
    totalActivities: snapshot.activities.length,
    upcomingAgendas: snapshot.agendas.length,
    totalCommunities: snapshot.komunitas.length,
    totalOrganizations: snapshot.organizations.length,
    totalEvents: snapshot.kegiatan.length,
    totalProducts: snapshot.products.length,
    recentPosts,
    upcomingEvents,
  };
};

export const getActivities = () => api.get('/activities').then(res => res.data);

export const activitiesApi = {
  getAll: () => api.get('/activities').then((res) => res.data),
  create: (data: unknown) => api.post('/activities', data).then((res) => res.data),
  update: (id: number | string, data: unknown) => api.put(`/activities/${id}`, data).then((res) => res.data),
  delete: (id: number | string) => api.delete(`/activities/${id}`).then((res) => res.data),
};

export const getOrganizations = () => api.get('/organizations').then(res => res.data);
export const organizationsApi = {
  getAll: () => api.get('/organizations').then(res => res.data),
  create: (data: Omit<Organization, 'id'>) => api.post('/organizations', data).then(res => res.data),
  update: (id: number, data: Partial<Organization>) => api.put(`/organizations/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/organizations/${id}`).then(res => res.data),
};

export const getProducts = () => api.get('/products').then(res => res.data);
export const productsApi = {
  getAll: () => api.get('/products').then(res => res.data),
  create: (data: Omit<Product, 'id'>) => api.post('/products', data).then(res => res.data),
  update: (id: number, data: Partial<Product>) => api.put(`/products/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/products/${id}`).then(res => res.data),
};

export const getPosts = () => api.get('/posts').then(res => res.data);
export const postsApi = {
  getAll: () => api.get('/posts').then(res => res.data),
  create: (data: Omit<Post, 'id'>) => api.post('/posts', data).then(res => res.data),
  update: (id: number, data: Partial<Post>) => api.put(`/posts/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/posts/${id}`).then(res => res.data),
};
export const getResume = () => getDataSnapshot().then(buildResume);
export const getStats = () => getDataSnapshot().then(buildStats);

export const housesApi = {
  getAll: () => api.get('/houses').then(res => res.data),
  create: (data: Omit<House, 'id'>) => api.post('/houses', data).then(res => res.data),
  update: (id: number, data: Partial<House>) => api.put(`/houses/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/houses/${id}`).then(res => res.data),
};

export const residentsApi = {
  getAll: async (): Promise<Array<Resident & { block: string; number: string }>> => {
    const [residents, houses] = await Promise.all([
      api.get('/residents').then((res) => toRows(res.data)),
      api.get('/houses').then((res) => toRows(res.data)),
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
  create: (data: Omit<Resident, 'id'>) => api.post('/residents', data).then(res => res.data),
  update: (id: number, data: Partial<Resident>) => api.put(`/residents/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/residents/${id}`).then(res => res.data),
};

export const paymentsApi = {
  getAll: async (month: number, year: number): Promise<Array<Payment & { block: string; number: string }>> => {
    const [payments, houses] = await Promise.all([
      api.get('/payments', { params: { month, year } }).then((res) => toRows(res.data)),
      api.get('/houses').then((res) => toRows(res.data)),
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
  generate: (month: number, year: number) => api.post('/payments/generate', { month, year }).then(res => res.data),
  pay: (id: number, data: Partial<Payment>) => api.put(`/payments/${id}/pay`, data).then(res => res.data),
};

export const getEvents = () => api.get('/kegiatan').then(res => res.data);
export const kegiatanApi = {
  getAll: () => api.get('/kegiatan').then(res => res.data),
  create: (data: Omit<Kegiatan, 'id'>) => api.post('/kegiatan', data).then(res => res.data),
  update: (id: number, data: Partial<Kegiatan>) => api.put(`/kegiatan/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/kegiatan/${id}`).then(res => res.data),
};

export const getCommunities = () => api.get('/komunitas').then(res => res.data);
export const komunitasApi = {
  getAll: () => api.get('/komunitas').then(res => res.data),
  create: (data: Omit<Komunitas, 'id'>) => api.post('/komunitas', data).then(res => res.data),
  update: (id: number, data: Partial<Komunitas>) => api.put(`/komunitas/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/komunitas/${id}`).then(res => res.data),
};

export const getAgendas = (params: { month: number; year: number }) =>
  api.get('/agendas', { params }).then((res) =>
    toRows(res.data).filter((agenda) => {
      const eventDate = toString(agenda.event_date);
      if (!eventDate) return true;
      const date = new Date(eventDate);
      if (Number.isNaN(date.getTime())) return true;
      return date.getMonth() + 1 === params.month && date.getFullYear() === params.year;
    }),
  );

export const agendasApi = {
  getAll: (params: { month: number; year: number }) => getAgendas(params),
  create: (data: Omit<Agenda, 'id'>) => api.post('/agendas', data).then(res => res.data),
  update: (id: number, data: Partial<Agenda>) => api.put(`/agendas/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/agendas/${id}`).then(res => res.data),
};

export default api;